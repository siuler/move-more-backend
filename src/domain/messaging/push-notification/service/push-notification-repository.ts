import { Pool } from 'mysql2/promise';
import { UserId } from '../../../user/user';
import { DBPushNotificationToken, PushNotificationType, PushNotification } from '../push-notification';
import { PushNotificationTokenAlreadyExistsError } from '../push-notification-error';
import { DBRowCount, toMySQLDate } from '../../../../general/mysql';

const STMT_INSERT_TOKEN = `INSERT INTO push_notification_token(user_id,token) VALUES(?,?)`;

const QUERY_GET_TOKENS = `SELECT token FROM push_notification_token WHERE user_id=?`;

const STMT_INSERT_SENT_NOTIFICATION = `INSERT INTO sent_push_notification(receiver_id,notification_type) VALUES(?,?)`;

const QUERY_GET_RECEIVED_NOTIFICATION_COUNT_SINCE = `SELECT COUNT(*) as row_count FROM sent_push_notification WHERE receiver_id=? AND notification_type=? AND timestamp >= ?`;

export class PushNotificationRepository {
    constructor(private connectionPool: Pool) {}

    public async storeToken(userId: UserId, token: string): Promise<void> {
        try {
            await this.connectionPool.execute(STMT_INSERT_TOKEN, [userId, token]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            if (e.code && e.code === 'ER_DUP_ENTRY') {
                throw new PushNotificationTokenAlreadyExistsError();
            }
            throw e;
        }
    }

    public async getTokens(userId: UserId): Promise<string[]> {
        const [tokens] = await this.connectionPool.query<DBPushNotificationToken[]>(QUERY_GET_TOKENS, [userId]);
        return tokens.map(token => token.token);
    }

    public async saveNotificationSent(receiver: UserId, notification: PushNotification) {
        await this.connectionPool.execute(STMT_INSERT_SENT_NOTIFICATION, [receiver, notification.notificationType]);
    }

    public async countReceivedNotificationsSince(userId: UserId, notificationType: PushNotificationType, since: Date) {
        const sinceAsMySQLDate = toMySQLDate(since);
        const [[rowCounts]] = await this.connectionPool.query<DBRowCount[]>(QUERY_GET_RECEIVED_NOTIFICATION_COUNT_SINCE, [
            userId,
            notificationType,
            sinceAsMySQLDate,
        ]);
        return rowCounts.row_count;
    }
}
