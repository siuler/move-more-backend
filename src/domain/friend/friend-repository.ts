import { Pool } from 'mysql2/promise';
import { UserId } from '../user/user';
import { Friend } from './friend';

const QUERY_GET_FRIEND_LIST = `
    SELECT 
        friend.friend_id as user_id,
        user.username as username
    FROM friend
    LEFT JOIN user
        ON user.id = friend.friend_id
    WHERE friend.user_id = ?
`;

export class FriendRepository {
    constructor(private connectionPool: Pool) {}

    public async getFriends(userId: UserId): Promise<Friend[]> {
        const [friendList] = await this.connectionPool.query<Friend[]>(QUERY_GET_FRIEND_LIST, [userId]);
        return friendList;
    }
}
