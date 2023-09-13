import { Migration } from '../migration';
import { EXERCISE_ID_TYPE, USER_ID_TYPE } from '../types';

export default class MigrationCreatePerformedExerciseTable extends Migration {
    public readonly migrationVersion = 9;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS performed_exercise(
                user_id ${USER_ID_TYPE},
                exercise_id ${EXERCISE_ID_TYPE},
                repetitions SMALLINT UNSIGNED,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)
                    REFERENCES user(id)
                    ON DELETE CASCADE,
                FOREIGN KEY (exercise_id)
                    REFERENCES exercise(id)
            )
        `);

        await this.connection.execute(`
            CREATE INDEX performed_exercise_user_exercise ON performed_exercise(user_id, exercise_id)
        `);
        await this.connection.execute(`
            CREATE INDEX performed_exercise_timestamp ON performed_exercise(timestamp)
        `);
    }
}
