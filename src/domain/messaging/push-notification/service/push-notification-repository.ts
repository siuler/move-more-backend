import { Pool } from 'mysql2/promise';
import { UserId } from '../../../user/user';
import { DBPushNotificationToken } from '../push-notification';
import { PushNotificationTokenAlreadyExistsError } from '../push-notification-error';

const STMT_INSERT_TOKEN = `INSERT INTO push_notification_token(user_id,token) VALUES(?,?)`;

const QUERY_GET_TOKENS = `SELECT token FROM push_notification_token WHERE user_id=?`;

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
}
