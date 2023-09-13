import { Connection, createConnection } from 'mysql2/promise';
import * as applicationConfig from '../config/config.json';
import { DBMigrationVersionResult } from './types';
import { MigrationCreateMigrationTable } from './mysql/0001-create-migration-table';
import { MigrationCreateUserTable } from './mysql/0002-create-user-table';
import { MigrationCreateRefreshTokenTable } from './mysql/0003-create-refresh-token-table';
import { MigrationCreateRecoveryCodeTable } from './mysql/0004-create-recovery-code-table';
import { MigrationCreateOAuthTable } from './mysql/0005-create-oauth-table';
import { MigrationCreateFriendTable } from './mysql/0006-create-friend-table';
import { MigrationCreateFriendRequestTable } from './mysql/0007-create-friend-request-table';
import { MigrationCreateExerciseTable } from './mysql/0008-create-exercise-table';
import { MigrationCreatePerformedExerciseTable } from './mysql/0009-create-performed-exercise-table';

const MIGRATIONS = [
    MigrationCreateMigrationTable,
    MigrationCreateUserTable,
    MigrationCreateRefreshTokenTable,
    MigrationCreateRecoveryCodeTable,
    MigrationCreateOAuthTable,
    MigrationCreateFriendTable,
    MigrationCreateFriendRequestTable,
    MigrationCreateExerciseTable,
    MigrationCreatePerformedExerciseTable,
];

export async function migrate() {
    const connection = await connect();
    await createDatabase(connection);

    await runMigrations(connection);
}

async function connect(): Promise<Connection> {
    return createConnection({
        host: applicationConfig.database.host,
        port: applicationConfig.database.port,
        user: applicationConfig.database.user,
        password: applicationConfig.database.password,
    });
}

async function createDatabase(connection: Connection) {
    const databaseName = applicationConfig.database.database;
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8`);
    await connection.changeUser({ database: databaseName });
}

async function runMigrations(connection: Connection) {
    const currentMigrationVersion = await getCurrentMigrationVersion(connection);

    let upgradedVersion = currentMigrationVersion;

    for (const migrationClass of MIGRATIONS) {
        const migration = new migrationClass(connection);
        if (migration.migrationVersion <= currentMigrationVersion) {
            continue;
        }
        if (upgradedVersion > migration.migrationVersion) {
            throw new Error('Database Migrations are not sorted in correct order. Version number must be array index + 1');
        }
        await migration.up();
        upgradedVersion = migration.migrationVersion;
    }

    await saveUpgradedMigrationVersion(connection, upgradedVersion);
}

async function getCurrentMigrationVersion(connection: Connection): Promise<number> {
    try {
        const [[version]] = await connection.query<DBMigrationVersionResult[]>(`SELECT current_version FROM migration`);
        return version.current_version;
    } catch (e) {
        if ((e as { code: string }).code === 'ER_NO_SUCH_TABLE') {
            return 0;
        }
        throw e;
    }
}

async function saveUpgradedMigrationVersion(connection: Connection, upgradedVersion: number) {
    await connection.execute(`UPDATE migration SET current_version=?`, [upgradedVersion]);
}
