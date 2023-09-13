import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export class MigrationCreateFriendRequestTable extends Migration {
    public readonly migrationVersion = 7;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS friend_request(
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
        await this.connection.execute(`CREATE INDEX friend_request_user_id ON friend_request(user_id)`);
        await this.connection.execute(`CREATE INDEX friend_request_friend_id ON friend_request(friend_id)`);
    }
}
