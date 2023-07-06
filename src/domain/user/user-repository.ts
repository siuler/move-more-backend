import { DBIsUserAvailableResult, DBUser, InsertUserPayload, User, UserId } from './user';
import { Pool } from 'mysql2/promise';
import { UserExistsError, UserNotFoundError } from './user-error';
import { asJavaScriptObject } from '../../repository/mysql/types';

const STMT_INSERT_USER = `INSERT INTO user(email, username, password_hash) VALUES(?,?,?)`;

const QUERY_FIND_USER_BY_ID = `SELECT id,email,username,password_hash,register_date,verified_date,provider FROM user WHERE id = ?`;
const QUERY_FIND_USER_BY_NAME = `SELECT id,email,username,password_hash,register_date,verified_date,provider FROM user WHERE username = ?`;
const QUERY_FIND_USER_BY_EMAIL = `SELECT id,email,username,password_hash,register_date,verified_date,provider FROM user WHERE email = ?`;

const QUERY_IS_USERNAME_AVAILABLE = `SELECT COUNT(id) as row_count_with_this_username FROM user WHERE username = ?`;

export class UserRepository {
    constructor(private connectionPool: Pool) {}

    public async isUsernameAvailable(username: string): Promise<boolean> {
        const [isTaken] = await this.connectionPool.query<[DBIsUserAvailableResult]>(QUERY_IS_USERNAME_AVAILABLE, [username]);
        return isTaken[0].row_count_with_this_username === 0;
    }

    public async create(user: InsertUserPayload): Promise<UserId> {
        try {
            const createdUser = await this.connectionPool.execute(STMT_INSERT_USER, [user.email, user.username, user.password_hash]);
            return (createdUser[0] as { insertId: number }).insertId;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.code && error.code === 'ER_DUP_ENTRY') {
                throw new UserExistsError('email or username already exists');
            }
            throw error;
        }
    }

    public async findById(userId: UserId): Promise<User> {
        const [foundUsers] = await this.connectionPool.query<DBUser[]>(QUERY_FIND_USER_BY_ID, [userId]);
        if (foundUsers.length == 0) {
            throw new UserNotFoundError('could not find user by userId');
        }
        return asJavaScriptObject(foundUsers[0]);
    }

    public async findByName(username: string): Promise<User> {
        const [foundUsers] = await this.connectionPool.query<DBUser[]>(QUERY_FIND_USER_BY_NAME, [username]);
        if (foundUsers.length == 0) {
            throw new UserNotFoundError('could not find user by username');
        }
        return asJavaScriptObject(foundUsers[0]);
    }

    public async findByEmail(email: string): Promise<User> {
        const [foundUsers] = await this.connectionPool.query<DBUser[]>(QUERY_FIND_USER_BY_EMAIL, [email]);
        if (foundUsers.length == 0) {
            throw new UserNotFoundError('could not find user by email');
        }
        return asJavaScriptObject(foundUsers[0]);
    }
}
