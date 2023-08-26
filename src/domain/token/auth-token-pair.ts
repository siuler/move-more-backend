import { RowDataPacket } from 'mysql2';

export type AuthResponse = AuthTokenPair & {
    username: string;
};

export type AuthTokenPair = {
    accessToken: string;
    refreshToken: string;
};

export interface DBRefreshToken extends RowDataPacket {
    refresh_token: string;
}
