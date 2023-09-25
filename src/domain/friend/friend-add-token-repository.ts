import { Pool } from 'mysql2/promise';
import { asJavaScriptObject, isMySqlError } from '../../repository/mysql/types';
import { UserId } from '../user/user';
import { DBFriendAddTokenInformation, FriendAddToken, FriendAddTokenInformation } from './friend';
import { AddFriendTokenAlreadyExistsError, InvalidFriendAddTokenError } from './friend-error';

const QUERY_GET_TOKEN_INFORMATION = `
    SELECT 
        user.username, 
        friend_add_token.addable_user_id as user_id, 
        friend_add_token.expiry 
    FROM friend_add_token
        LEFT JOIN user
            ON user.id = friend_add_token.addable_user_id
    WHERE friend_add_token.token = ?`;

const STMT_INSERT_TOKEN = `INSERT INTO friend_add_token(addable_user_id,token,expiry) VALUES(?,?,?)`;

export class FriendAddTokenRepository {
    constructor(private connectionPool: Pool) {}

    public async getTokenInformation(token: FriendAddToken): Promise<FriendAddTokenInformation> {
        const [friendRequests] = await this.connectionPool.query<DBFriendAddTokenInformation[]>(QUERY_GET_TOKEN_INFORMATION, [token]);
        if (friendRequests.length == 0) {
            throw new InvalidFriendAddTokenError();
        }
        const tokenInformation = asJavaScriptObject(friendRequests[0]) as FriendAddTokenInformation;
        tokenInformation.expiry = new Date(tokenInformation.expiry);
        return asJavaScriptObject(friendRequests[0]);
    }

    public async saveToken(addableUser: UserId, token: FriendAddToken, expiryDate: Date) {
        const mysqlExpiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');
        try {
            await this.connectionPool.execute(STMT_INSERT_TOKEN, [addableUser, token, mysqlExpiryDate]);
        } catch (err: unknown) {
            if (!isMySqlError(err)) {
                throw err;
            }
            if (err.code && err.code == 'ERR_DUP_ENTRY') {
                throw new AddFriendTokenAlreadyExistsError();
            }
            throw err;
        }
    }
}
