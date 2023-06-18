import { RowDataPacket } from 'mysql2';

export type AuthTokenPair = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshToken extends RowDataPacket {
    refresh_token: string;
}
