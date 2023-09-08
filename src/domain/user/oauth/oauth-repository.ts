import { Pool } from 'mysql2/promise';
import { UserIdContainer } from './oauth';
import { UserNotFoundError } from '../user-error';

const QUERY_FIND_USER_ID_BY_SUBJECT = `SELECT user_id FROM oauth WHERE subject=? AND provider=?`;

const STMT_INSERT_USER = `INSERT INTO oauth(subject,user_id,provider) VALUES(?,?,?)`;

export class OAuthRepository {
    constructor(private connectionPool: Pool) {}

    public async findUserIdForSubject(subject: string, provider: string) {
        const [userIdContaier] = await this.connectionPool.query<UserIdContainer[]>(QUERY_FIND_USER_ID_BY_SUBJECT, [subject, provider]);
        if (userIdContaier.length === 0) {
            throw new UserNotFoundError();
        }
        return userIdContaier[0].user_id;
    }

    public async createOauthUser(subject: string, userId: number, provider: string) {
        await this.connectionPool.execute(STMT_INSERT_USER, [subject, userId, provider]);
    }
}
