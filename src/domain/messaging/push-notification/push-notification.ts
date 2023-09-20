import { RowDataPacket } from 'mysql2';

export interface DBPushNotificationToken extends RowDataPacket {
    token: string;
}

export class PushNotification {
    constructor(
        public readonly title: string,
        public readonly body: string,
        public readonly data?: Record<string, string>,
        public readonly sound = 'default'
    ) {}
}
