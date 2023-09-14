import * as admin from 'firebase-admin';
import * as firebaseServiceAccountKey from './firebaseServiceAccountKey.json';
import { asJavaScriptObject } from '../../../../repository/mysql/types';
import { UserId } from '../../../user/user';
import { Logger } from '../../../../general/logger';
import { PushNotificationRepository } from './push-notification-repository';
import { PushNotificationTokenTooLongError } from '../push-notification-error';
import { PushNotification } from '../push-notification';

export class PushNotificationService {
    constructor(private pushNotificationRepository: PushNotificationRepository) {
        admin.initializeApp({
            credential: admin.credential.cert(asJavaScriptObject(firebaseServiceAccountKey)),
        });
    }

    public async storeToken(userId: UserId, token: string): Promise<void> {
        if (token.length > 255) {
            Logger.warn('received a push notification token longer then 255 characters for userId', userId, token);
            throw new PushNotificationTokenTooLongError();
        }
        return this.pushNotificationRepository.storeToken(userId, token);
    }

    public async sendNotification(userId: UserId, notification: PushNotification) {
        const tokens = await this.pushNotificationRepository.getTokens(userId);
        Logger.info('sending push notification to', userId);
        if (tokens.length == 0) {
            Logger.debug('not sending message to', userId, 'because he has no FCM device token registered');
            return;
        }

        const messages = tokens.map(token => this.createPushMessage(token, notification));

        await admin.messaging().sendEach(messages);
    }

    private createPushMessage(token: string, notification: PushNotification) {
        return {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            token,
        };
    }
}
