import * as applicationConfig from '../../config/config.json';
import { Connection, createConnection } from 'mysql2/promise';

const USER_ID_TYPE = 'MEDIUMINT UNSIGNED';
const EXERCISE_ID_TYPE = 'TINYINT(255) UNSIGNED';

export async function createDatabaseScheme() {
    const databaseName = applicationConfig.database.database;
    const connection = await createConnection({
        host: applicationConfig.database.host,
        port: applicationConfig.database.port,
        user: applicationConfig.database.user,
        password: applicationConfig.database.password,
    });

    const [createDatabaseResult] = await connection.execute(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8`);
    if ((createDatabaseResult as unknown as { affectedRows: number }).affectedRows == 0) {
        console.log('[INFO]: database already exists, skipping database initialization process.');
        return;
    }

    await connection.changeUser({ database: databaseName });

    await createUserTable(connection);
    await createRefreshTokenTable(connection);

    await createFriendTable(connection);

    await createExerciseTable(connection);

    await createPerformedExerciseTable(connection);
}

async function createUserTable(connection: Connection) {
    await connection.execute(`
		CREATE TABLE IF NOT EXISTS user(
		    id ${USER_ID_TYPE} AUTO_INCREMENT,
		    email VARCHAR(255) UNIQUE,
		    username VARCHAR(16) UNIQUE,
		    password_hash CHAR(60) NOT NULL,
		    register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		    verified_date TIMESTAMP NULL,
		    provider TIMESTAMP NULL,
		    PRIMARY KEY(id)
		)
	`);
}

async function createFriendTable(connection: Connection) {
    await connection.execute(`
		CREATE TABLE IF NOT EXISTS friend(
			user_id ${USER_ID_TYPE},
			friend_id ${USER_ID_TYPE},
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY(user_id)
		)
	`);
}

async function createRefreshTokenTable(connection: Connection) {
    await connection.execute(`
		CREATE TABLE IF NOT EXISTS refresh_token(
		    user_id ${USER_ID_TYPE},
		    refresh_token TEXT,
		    PRIMARY KEY (user_id),
		    FOREIGN KEY (user_id)
		        REFERENCES user(id)
		        ON DELETE CASCADE
		)
	`);
}

async function createExerciseTable(connection: Connection) {
    await connection.execute(`
		CREATE TABLE IF NOT EXISTS exercise(
		    id ${EXERCISE_ID_TYPE} AUTO_INCREMENT,
		    name VARCHAR(255) UNIQUE,
			pluralized_name VARCHAR(255),
			image_url TINYTEXT,
		    PRIMARY KEY (id)
		)
	`);
    await connection.execute(`
		INSERT INTO exercise(name, pluralized_name, image_url) 
		VALUES ('Push-Up', 'Push-Ups', '')
	`);
}

async function createPerformedExerciseTable(connection: Connection) {
    await connection.execute(`
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

    await connection.execute(`
		CREATE INDEX performed_exercise_user_exercise ON performed_exercise(user_id, exercise_id)
	`);
}
