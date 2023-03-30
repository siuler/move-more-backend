import { createPool, Pool, PoolOptions } from "mysql2/promise";


export class MysqlConnectionPool {
	private static connectionPool: Pool;
	public static async initialize(poolOptions: PoolOptions) {
		MysqlConnectionPool.connectionPool = createPool(poolOptions);
	}

	public static getInstance(): Pool {
		return MysqlConnectionPool.connectionPool;
	}
}