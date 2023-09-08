import { RowDataPacket } from 'mysql2';

export interface UserIdContainer extends RowDataPacket {
    user_id: number;
}

export const OAUTH_PROVIDER_GOOGLE = 'google';
export const OAUTH_PROVIDER_APPLE = 'apple';
