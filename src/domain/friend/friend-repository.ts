import { Pool } from 'mysql2/promise';
import { UserId } from '../user/user';
import { DBFriend, Friend } from './friend';
import { asJavaScriptObject } from '../../repository/mysql/types';

const QUERY_GET_FRIEND_LIST = `
    SELECT 
        friend.friend_id as user_id,
        user.username as username
    FROM friend
    LEFT JOIN user
        ON user.id = friend.friend_id
    WHERE friend.user_id = ?
`;

const QUERY_FIND_FRIEND = `
    SELECT 
        user.id as user_id,
        NOT ISNULL(friend.friend_id) as is_friend,
        user.username as username 
    FROM user 
    LEFT JOIN friend
        ON friend.user_id = ? AND friend.friend_id = user.id
    WHERE username LIKE CONCAT('%', ?, '%')
        AND user.id != ?  
    ORDER BY LOCATE(?, username) ASC, 
        username ASC`;

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
}
