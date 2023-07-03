import { RowDataPacket } from 'mysql2';
import { JavaScriptObject } from '../../repository/mysql/types';

export type AuthTokenPair = {
    accessToken: string;
    refreshToken: string;
};

export interface DBRefreshToken extends RowDataPacket {
    refresh_token: string;
}
