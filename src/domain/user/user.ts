import { RowDataPacket } from 'mysql2';

export type UserId = number;
export interface IUser extends RowDataPacket {
    id: UserId;
    email: string;
    username: string;
    password_hash: string;
    register_date: string;
    verified_date: string;
    provider: 'internal' | 'google' | 'apple';
}

export type InsertUserPayload = {
    email: string;
    username: string;
    password_hash: string;
};
