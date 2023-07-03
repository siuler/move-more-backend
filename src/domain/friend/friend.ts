import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';
import { JavaScriptObject } from '../../repository/mysql/types';

export interface DBFriend extends RowDataPacket {
    user_id: UserId;
    username: string;
}
export type Friend = JavaScriptObject<DBFriend>;
