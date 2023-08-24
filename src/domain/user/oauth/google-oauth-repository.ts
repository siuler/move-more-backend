import { Pool } from 'mysql2/promise';
import { UserIdContainer } from './oauth';
import { UserNotFoundError } from '../user-error';

const QUERY_FIND_USER_ID_BY_SUBJECT = `SELECT user_id FROM oauth WHERE subject=?`;

const STMT_INSERT_USER = `INSERT INTO oauth(subject,user_id,provider) VALUES(?,?,?)`;

export class GoogleOAuthRepository {
    constructor(private connectionPool: Pool) {}

    public async findUserIdForSubject(subject: string) {
        const [userIdContaier] = await this.connectionPool.query<UserIdContainer[]>(QUERY_FIND_USER_ID_BY_SUBJECT, [subject]);
        if (userIdContaier.length === 0) {
            throw new UserNotFoundError();
        }
        return userIdContaier[0].user_id;
    }

    public async createUserWithGoogle(subject: string, userId: number) {
        await this.connectionPool.execute(STMT_INSERT_USER, [subject, userId, 'google']);
    }
}
