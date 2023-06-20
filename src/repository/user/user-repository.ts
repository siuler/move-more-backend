import { InsertUserPayload, IUser, UserId } from '../../domain/user/user';
import { Pool } from 'mysql2/promise';
import { UserExistsError, UserNotFoundError } from '../../domain/user/user-error';

const STMT_INSERT_USER = `INSERT INTO user(email, username, password_hash) VALUES(?,?,?)`;

const QUERY_FIND_USER_BY_ID = `SELECT id,email,username,password_hash,register_date,verified_date,provider FROM user WHERE id = ?`;
const QUERY_FIND_USER_BY_NAME = `SELECT id,email,username,password_hash,register_date,verified_date,provider FROM user WHERE username = ?`;
const QUERY_FIND_USER_BY_EMAIL = `SELECT id,email,username,password_hash,register_date,verified_date,provider FROM user WHERE email = ?`;

export class UserRepository {
    constructor(private connectionPool: Pool) {}

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

    public async findById(userId: UserId): Promise<IUser> {
        const [foundUsers] = await this.connectionPool.query<IUser[]>(QUERY_FIND_USER_BY_ID, [userId]);
        if (foundUsers.length == 0) {
            throw new UserNotFoundError('could not find user by userId');
        }
        return foundUsers[0];
    }

    public async findByName(username: string): Promise<IUser> {
        const [foundUsers] = await this.connectionPool.query<IUser[]>(QUERY_FIND_USER_BY_NAME, [username]);
        if (foundUsers.length == 0) {
            throw new UserNotFoundError('could not find user by username');
        }
        return foundUsers[0];
    }

    public async findByEmail(email: string): Promise<IUser> {
        const [foundUsers] = await this.connectionPool.query<IUser[]>(QUERY_FIND_USER_BY_EMAIL, [email]);
        if (foundUsers.length == 0) {
            throw new UserNotFoundError('could not find user by email');
        }
        return foundUsers[0];
    }
}
