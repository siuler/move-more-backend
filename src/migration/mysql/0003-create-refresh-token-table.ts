import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export class MigrationCreateRefreshTokenTable extends Migration {
    public readonly migrationVersion = 3;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS refresh_token(
                user_id ${USER_ID_TYPE},
                refresh_token TEXT,
                PRIMARY KEY (user_id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            )
        `);
    }
}
