import { RowDataPacket } from 'mysql2';

export type PushNotificationType =
    | 'OVERTAKEN_BY_FRIEND'
    | 'FRIEND_ALREADY_WORKED_OUT'
    | 'FRIEND_REQUEST_RECEIVED'
    | 'FRIEND_REQUEST_ACCEPTED';

export interface DBPushNotificationToken extends RowDataPacket {
    token: string;
}

export abstract class PushNotification {
    constructor(
        public readonly title: string,
        public readonly body: string,
        public readonly notificationType: PushNotificationType,
        public readonly data?: Record<string, string>,
        public readonly sound = 'default'
    ) {}
}
