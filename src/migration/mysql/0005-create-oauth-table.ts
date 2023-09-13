import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export class MigrationCreateOAuthTable extends Migration {
    public readonly migrationVersion = 5;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS oauth(
                subject VARCHAR(255),
                user_id ${USER_ID_TYPE} UNIQUE,
                provider VARCHAR(16),
                PRIMARY KEY (subject),
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            )
        `);
    }
}
