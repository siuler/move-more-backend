import { Connection, createConnection } from 'mysql2/promise';
import * as applicationConfig from '../config/config.json';
import { DBMigrationVersionResult } from './types';
import * as fs from 'fs';
import { Logger } from '../general/logger';
import * as path from 'path';

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

    const migrations = await getMigrations();

    let upgradedVersion = currentMigrationVersion;
    for (const migrationClass of migrations) {
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

async function getMigrations() {
    const migrations = [];
    const migrationsDirectory = path.join(__dirname, 'mysql');
    const files = fs.readdirSync(migrationsDirectory);
    for (const file of files) {
        Logger.warnIf(!file.endsWith('.ts'), 'found file in migrations folder that is not a .ts file', file);
        const filePath = path.join(migrationsDirectory, file);
        const module = await import(filePath);
        if (!module.default) {
            Logger.warn('found migration without default export', file);
            continue;
        }
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
