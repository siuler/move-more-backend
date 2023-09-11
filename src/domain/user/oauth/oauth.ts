import { RowDataPacket } from 'mysql2';

export interface UserIdContainer extends RowDataPacket {
    user_id: number;
}

export type OAuthTokenPayload = {
    iss: string;
    exp: number;
    iat: number;
    sub: string;
    email?: string;
    email_verified?: boolean;
};
