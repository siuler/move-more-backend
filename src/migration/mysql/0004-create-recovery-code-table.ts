import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export default class MigrationCreateRecoveryCodeTable extends Migration {
    public readonly migrationVersion = 4;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS recovery_code(
                user_id ${USER_ID_TYPE} UNIQUE,
                code CHAR(6),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            )
        `);
    }
}
