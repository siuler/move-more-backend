import { Migration } from '../migration';
import { USER_ID_TYPE } from '../types';

export default class MigrationCreateFriendAddTokenTable extends Migration {
    public readonly migrationVersion = 11;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS friend_add_token(
                addable_user_id ${USER_ID_TYPE},
                token VARCHAR(8) UNIQUE,
                expiry TIMESTAMP,
                PRIMARY KEY(token),
                FOREIGN KEY (addable_user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE
            )
        `);
    }
}
