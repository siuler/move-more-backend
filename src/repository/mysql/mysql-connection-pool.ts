import { createPool, Pool } from 'mysql2/promise';
import * as applicationConfig from '../../config/config.json';

export class MysqlConnectionPool {
    private static connectionPool: Pool;
    public static async initialize() {
        MysqlConnectionPool.connectionPool = createPool({
            host: applicationConfig.database.host,
            port: applicationConfig.database.port,
            user: applicationConfig.database.user,
            password: applicationConfig.database.password,
            database: applicationConfig.database.database,
            timezone: '+00:00',
        });
    }

    public static getInstance(): Pool {
        return MysqlConnectionPool.connectionPool;
    }
}
