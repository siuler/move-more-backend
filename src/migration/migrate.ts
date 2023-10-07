import { Connection, createConnection } from 'mysql2/promise';
import * as applicationConfig from '../config/config.json';
import { DBMigrationVersionResult } from './types';
import * as fs from 'fs';
import { Logger } from '../general/logger';
import * as path from 'path';

export async function migrate() {
    Logger.info('Connecting to mySQL Database...');
    const connection = await connect();
    Logger.info('Creating database...');
    await createDatabase(connection);

    Logger.info('running migrations...');
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
    Logger.info('Getting current migration version');
    const currentMigrationVersion = await getCurrentMigrationVersion(connection);
    Logger.info('Current migration version:', currentMigrationVersion);
    Logger.info('Retrieving all migration files');
    const migrations = await getMigrations();

    let upgradedVersion = currentMigrationVersion;
    Logger.info('Applying all migrations...');
    for (const migrationClass of migrations) {
        Logger.info('instantiating a migration');
        const migration = new migrationClass(connection);
        Logger.info('migration', migration.migrationVersion, 'instantiated');
        if (migration.migrationVersion <= currentMigrationVersion) {
            continue;
        }
        if (upgradedVersion > migration.migrationVersion) {
            throw new Error('Database Migrations are not sorted in correct order. Version number must be array index + 1');
        }
        Logger.info('applying migration');
        await migration.up();
        upgradedVersion = migration.migrationVersion;
    }

    Logger.info('saving upgraded migration version to database');
    await saveUpgradedMigrationVersion(connection, upgradedVersion);
}

async function getMigrations() {
    const migrations = [];
    const migrationsDirectory = path.join(__dirname, 'mysql');
    Logger.info('Reading directory');
    const files = fs.readdirSync(migrationsDirectory);
    Logger.info('Done. Found', files.length, 'files');
    for (const file of files) {
        Logger.warnIf(!file.endsWith('.ts'), 'found file in migrations folder that is not a .ts file', file);
        const filePath = path.join(migrationsDirectory, file);
        Logger.info('importing', file.toString());
        const module = await import(filePath);
        if (!module.default) {
            Logger.warn('found migration without default export', file);
            continue;
        }
        Logger.info('adding to migration list');
        migrations.push(module.default);
    }
    return migrations;
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
