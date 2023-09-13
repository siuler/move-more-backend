import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export default class MigrationCreatePushNotificationTokenTable extends Migration {
    public readonly migrationVersion = 10;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS push_notification_token(
                user_id ${USER_ID_TYPE},
                token VARCHAR(255) UNIQUE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            )
        `);

        await this.connection.execute(`
            CREATE INDEX push_notification_token_user ON push_notification_token(user_id)
        `);
    }
}
