import { Migration } from '../migration';
import { EXERCISE_ID_TYPE } from '../types';

export class MigrationCreateExerciseTable extends Migration {
    public readonly migrationVersion = 8;
    async up(): Promise<void> {
        await this.connection.execute(`
            CREATE TABLE IF NOT EXISTS exercise(
                id ${EXERCISE_ID_TYPE} AUTO_INCREMENT,
                name VARCHAR(255) UNIQUE,
                pluralized_name VARCHAR(255),
                image_url TINYTEXT,
                PRIMARY KEY (id)
            )
        `);
        await this.connection.execute(`
            INSERT INTO exercise(name, pluralized_name, image_url) 
            VALUES ('Push-Up', 'Push-Ups', '')
        `);
    }
}
