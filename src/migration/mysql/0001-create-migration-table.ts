import { Migration } from '../migration';

export class MigrationCreateMigrationTable extends Migration {
    public readonly migrationVersion = 1;

    async up() {
        await this.connection.execute(`CREATE TABLE IF NOT EXISTS migration(current_version MEDIUMINT)`);
        await this.connection.execute(`INSERT INTO migration(current_version) VALUES(1)`);
    }
}
