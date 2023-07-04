import { Pool } from 'mysql2/promise';
import { User, UserId } from '../user/user';
import { DBAreFriendsResult, DBFriend, DBHasSentFriendRequestResult, Friend } from './friend';
import { asJavaScriptObject, isMySqlError } from '../../repository/mysql/types';
import { UserNotFoundError } from '../user/user-error';

const QUERY_GET_FRIEND_LIST = `
    SELECT 
        friend.friend_id AS user_id,
        user.username AS username
    FROM friend
    LEFT JOIN user
        ON user.id = friend.friend_id
    WHERE friend.user_id = ?
`;

const QUERY_FIND_FRIEND = `
    SELECT 
        user.id AS user_id,
        NOT ISNULL(friend.friend_id) AS is_friend,
        user.username AS username 
    FROM user 
    LEFT JOIN friend
        ON friend.user_id = ? AND friend.friend_id = user.id
    WHERE username LIKE CONCAT('%', ?, '%')
        AND user.id != ?  
    ORDER BY LOCATE(?, username) ASC, 
        username ASC`;

const QUERY_ARE_FRIENDS = `SELECT COUNT(*) > 0 AS are_friends FROM friend WHERE (user_id=? AND friend_id=?)`;

const QUERY_HAS_SENT_FRIEND_REQUEST = `SELECT COUNT(*) > 0 AS has_sent_request FROM friend_request WHERE user_id=? AND friend_id=?`;

const STMT_SEND_FRIEND_REQUEST = `INSERT INTO friend_request(user_id, friend_id) VALUES(?, ?)`;
const STMT_DELETE_FRIEND_REQUEST = `DELETE FROM friend_request WHERE user_id=? and friend_id=?`;
const STMT_INSERT_FRIENDS = `INSERT INTO friend(user_id,friend_id) VALUES(?,?),(?,?)`;

export class FriendRepository {
    constructor(private connectionPool: Pool) {}

    public async getFriends(userId: UserId): Promise<Friend[]> {
        const [friendList] = await this.connectionPool.query<DBFriend[]>(QUERY_GET_FRIEND_LIST, [userId]);
        return friendList.map(asJavaScriptObject);
    }

    public async findFriends(forUser: UserId, query: string): Promise<Friend[]> {
        const [foundUsers] = await this.connectionPool.query<DBFriend[]>(QUERY_FIND_FRIEND, [forUser, query, forUser, query]);
        return foundUsers.map(asJavaScriptObject);
    }

    public async areFriends(user1: UserId, user2: UserId): Promise<boolean> {
        const [areFriends] = await this.connectionPool.query<DBAreFriendsResult[]>(QUERY_ARE_FRIENDS, [user1, user2]);
        return areFriends[0].are_friends == 1;
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
        await this.connectionPool.execute(STMT_DELETE_FRIEND_REQUEST, [from, to]);
    }

    public async hasSentFriendRequest(sender: UserId, receiver: UserId): Promise<boolean> {
        const [hasSent] = await this.connectionPool.query<DBHasSentFriendRequestResult[]>(QUERY_HAS_SENT_FRIEND_REQUEST, [
            sender,
            receiver,
        ]);
        return hasSent[0].has_sent_request == 1;
    }

    public async insertFriends(friend1: UserId, friend2: UserId) {
        try {
            await this.connectionPool.execute(STMT_INSERT_FRIENDS, [friend1, friend2, friend2, friend1]);
        } catch (error) {
            if (isMySqlError(error) && error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new UserNotFoundError();
            }
            throw error;
        }
    }
}
