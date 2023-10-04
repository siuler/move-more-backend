import { RowDataPacket } from 'mysql2';
import { JavaScriptObject } from '../../repository/mysql/types';

export type UserId = number;
export interface DBMinimalUser extends RowDataPacket {
    id: UserId;
    username: string;
}
export type MinimalUser = JavaScriptObject<DBMinimalUser>;

export interface DBUser extends RowDataPacket, DBMinimalUser {
    email: string;
    password_hash: string;
    register_date: string;
    verified_date: string;
    provider: 'internal' | 'google' | 'apple';
}
export type User = JavaScriptObject<DBUser>;

export type InsertUserPayload = {
    email: string;
    username: string;
    password_hash: string | null;
};
