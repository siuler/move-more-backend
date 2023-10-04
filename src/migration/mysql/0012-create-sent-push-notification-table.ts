import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export default class MigrationCreateFriendAddTokenTable extends Migration {
    public readonly migrationVersion = 12;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS sent_push_notification(
                receiver_id ${USER_ID_TYPE},
                notification_type VARCHAR(30),
                timestamp TIMESTAMP,
                FOREIGN KEY (receiver_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            )
        `);

        await this.connection.execute(`
            CREATE INDEX sent_push_notification_receiver_timestamp ON sent_push_notification(receiver_id,timestamp)
        `);

        await this.connection.execute(`
            CREATE INDEX sent_push_notification_receiver_notification_timestamp ON sent_push_notification(receiver_id,notification_type,timestamp)
        `);
    }
}
