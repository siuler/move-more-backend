import { RowDataPacket } from 'mysql2';

export interface DBPushNotificationToken extends RowDataPacket {
    token: string;
}

export abstract class PushNotification {
    constructor(protected title: string, protected body: string) {}
}
