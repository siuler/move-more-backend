import * as admin from 'firebase-admin';
import * as firebaseServiceAccountKey from './firebaseServiceAccountKey.json';
import { asJavaScriptObject } from '../../../../repository/mysql/types';
import { UserId } from '../../../user/user';
import { Logger } from '../../../../general/logger';
import { PushNotificationRepository } from './push-notification-repository';
import { PushNotificationTokenTooLongError } from '../push-notification-error';
import { PushNotificationType, PushNotification } from '../push-notification';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { scheduleJob } from 'node-schedule';
import { InternalEventBus } from '../../../../general/internal-event/event-bus';
import { NobodyMovedNotificationTimeEvent } from '../nobody-moved-notification-time-event';

export class PushNotificationService {
    constructor(private pushNotificationRepository: PushNotificationRepository) {
        this.initFirebase();
        this.setupNotificationScheduler();
    }

    public async storeToken(userId: UserId, token: string): Promise<void> {
        if (token.length > 255) {
            Logger.warn('received a push notification token longer then 255 characters for userId', userId, token);
            throw new PushNotificationTokenTooLongError();
        }
        return this.pushNotificationRepository.storeToken(userId, token);
    }

    public async sendNotificationWithoutSpam(maxOfTypePerDay: number, userId: UserId, notification: PushNotification) {
        const notificationCountReceivedToday = await this.countReceivedNotificationsOfType(userId, notification.notificationType);
        if (notificationCountReceivedToday >= maxOfTypePerDay) {
            return;
        }
        this.sendNotification(userId, notification);
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
        await this.pushNotificationRepository.saveNotificationSent(userId, notification);
    }

    public async countReceivedNotificationsOfType(userId: UserId, notificationType: PushNotificationType) {
        const todayBegin = new Date();
        todayBegin.setUTCHours(0);
        todayBegin.setUTCMinutes(0);
        todayBegin.setUTCSeconds(0);
        return this.pushNotificationRepository.countReceivedNotificationsSince(userId, notificationType, todayBegin);
    }

    private initFirebase() {
        admin.initializeApp({
            credential: admin.credential.cert(asJavaScriptObject(firebaseServiceAccountKey)),
        });
    }

    private setupNotificationScheduler() {
        /*
            *    *    *    *    *    * 
            ┬    ┬    ┬    ┬    ┬    ┬
            │    │    │    │    │    │
            │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
            │    │    │    │    └───── month (1 - 12)
            │    │    │    └────────── day of month (1 - 31)
            │    │    └─────────────── hour (0 - 23)
            │    └──────────────────── minute (0 - 59)
            └───────────────────────── second (0 - 59, OPTIONAL)
         */
        scheduleJob('0 0 8 * * *', () => InternalEventBus.emit(new NobodyMovedNotificationTimeEvent()));
    }

    private createPushMessage(token: string, notification: PushNotification): Message {
        return {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data,
            android: {
                priority: 'high',
            },
            apns: {
                payload: {
                    aps: {
                        sound: notification.sound,
                    },
                },
            },
            token,
        };
    }
}
