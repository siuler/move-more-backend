import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export default class MigrationCreateUserTable extends Migration {
    public readonly migrationVersion = 2;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS user(
                id ${USER_ID_TYPE} AUTO_INCREMENT,
                email VARCHAR(255) UNIQUE,
                username VARCHAR(16) UNIQUE,
                password_hash CHAR(60) NULL,
                register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verified_date TIMESTAMP NULL,
                provider TIMESTAMP NULL,
                PRIMARY KEY(id)
            )
        `);
    }
}
