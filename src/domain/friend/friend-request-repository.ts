import { Pool } from 'mysql2/promise';
import { asJavaScriptObject, isMySqlError } from '../../repository/mysql/types';
import { UserId } from '../user/user';
import { UserNotFoundError } from '../user/user-error';
import { DBFriendRequest, DBHasSentFriendRequestResult, FriendRequest } from './friend';

const QUERY_LIST_FRIEND_REQUESTS = `
    SELECT 
        friend_request.user_id as user_id, 
        user.username as username
    FROM friend_request
        LEFT JOIN user
            ON user.id = friend_request.user_id
    WHERE friend_request.friend_id = ?`;
const QUERY_HAS_SENT_FRIEND_REQUEST = `SELECT COUNT(*) > 0 AS has_sent_request FROM friend_request WHERE user_id=? AND friend_id=?`;

const STMT_SEND_FRIEND_REQUEST = `INSERT INTO friend_request(user_id, friend_id) VALUES(?, ?)`;
const STMT_DELETE_FRIEND_REQUEST = `DELETE FROM friend_request WHERE (user_id=? and friend_id=?) or (user_id=? and friend_id=?)`;

export class FriendRequestRepository {
    constructor(private connectionPool: Pool) {}

    public async listFriendRequest(userId: UserId): Promise<FriendRequest[]> {
        const [friendRequests] = await this.connectionPool.query<DBFriendRequest[]>(QUERY_LIST_FRIEND_REQUESTS, [userId]);
        return friendRequests.map(asJavaScriptObject);
    }

    public async sendFriendRequest(sender: UserId, receiver: UserId) {
        try {
            await this.connectionPool.execute(STMT_SEND_FRIEND_REQUEST, [sender, receiver]);
        } catch (error) {
            if (isMySqlError(error) && error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new UserNotFoundError();
            }
            throw error;
        }
    }

    public async removeFriendRequest(from: UserId, to: UserId) {
        await this.connectionPool.execute(STMT_DELETE_FRIEND_REQUEST, [from, to, to, from]);
    }

    public async hasSentFriendRequest(sender: UserId, receiver: UserId): Promise<boolean> {
        const [hasSent] = await this.connectionPool.query<DBHasSentFriendRequestResult[]>(QUERY_HAS_SENT_FRIEND_REQUEST, [
            sender,
            receiver,
        ]);
        return hasSent[0].has_sent_request == 1;
    }
}
