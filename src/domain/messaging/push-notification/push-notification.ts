import { RowDataPacket } from 'mysql2';

export interface DBPushNotificationToken extends RowDataPacket {
    token: string;
}

export abstract class PushNotification {
    constructor(public readonly title: string, public readonly body: string) {}
}
