import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';

export interface Friend extends RowDataPacket {
    user_id: UserId;
    username: string;
}
