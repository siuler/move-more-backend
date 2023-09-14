import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export default class MigrationCreateFriendTable extends Migration {
    public readonly migrationVersion = 6;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS friend(
                user_id ${USER_ID_TYPE},
                friend_id ${USER_ID_TYPE},
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(user_id, friend_id),
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (friend_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            )
        `);
        await this.connection.execute(`CREATE INDEX friend_user_id ON friend(user_id)`);
    }
}
