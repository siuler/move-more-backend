import { UserId } from "../../domain/user/user-database-payload";
import { Pool } from "mysql2/promise";
import { IRefreshToken } from "../../domain/token/auth-token-pair";
import { TokenNotFoundError } from "../../domain/token/token-not-found-error";

const STMT_INSERT_REFRESH_TOKEN = `INSERT INTO refresh_token(user_id, refresh_token) VALUES(?,?) ON DUPLICATE KEY UPDATE refresh_token = VALUES(refresh_token)`;

const QUERY_FIND_REFRESH_TOKEN = `SELECT refresh_token FROM refresh_token WHERE user_id = ?`;

export class TokenRepository {
	constructor(private connectionPool: Pool) {}

	public async store(userId: UserId, refreshToken: string): Promise<void> {
		await this.connectionPool.execute(STMT_INSERT_REFRESH_TOKEN, [userId, refreshToken]);
	}

	public async findByUserId(userId: UserId): Promise<string> {
		const [foundToken] = await this.connectionPool.query<IRefreshToken[]>(QUERY_FIND_REFRESH_TOKEN, [userId]);
		if (foundToken.length == 0) {
			throw new TokenNotFoundError('could not find token for this userid');
		}
		return foundToken[0].refresh_token;
	}
}