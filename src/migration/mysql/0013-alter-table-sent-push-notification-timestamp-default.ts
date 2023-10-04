import { Migration } from '../migration';

export default class MigrationCreateSentPushNotificationTable extends Migration {
    public readonly migrationVersion = 13;
    async up(): Promise<void> {
        await this.connection.execute(`
            ALTER TABLE sent_push_notification
            ALTER COLUMN timestamp
            SET DEFAULT CURRENT_TIMESTAMP;        
        `);
    }
}
