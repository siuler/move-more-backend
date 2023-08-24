import { RowDataPacket } from 'mysql2';

export interface UserIdContainer extends RowDataPacket {
    user_id: number;
}
