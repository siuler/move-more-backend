import * as applicationConfig from '../../config/config.json';
import { createConnection } from "mysql2/promise";

export async function createDatabaseScheme() {
	const databaseName = applicationConfig.database.database;
	const connection = await createConnection({
		host: applicationConfig.database.host,
		port: applicationConfig.database.port,
		user: applicationConfig.database.user,
		password: applicationConfig.database.password,
	});

	await connection.execute(`CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8`);
	await connection.changeUser({database: databaseName});

	await connection.execute(`
		CREATE TABLE IF NOT EXISTS user(
		    id MEDIUMINT UNSIGNED AUTO_INCREMENT,
		    email VARCHAR(255) UNIQUE,
		    username VARCHAR(16) UNIQUE,
		    password_hash CHAR(60) NOT NULL,
		    register_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		    verified_date TIMESTAMP NULL,
		    provider TIMESTAMP NULL,
		    PRIMARY KEY(id)
		)
	`);

	await connection.execute(`
		CREATE TABLE IF NOT EXISTS refresh_token(
		    user_id MEDIUMINT UNSIGNED,
		    refresh_token TEXT,
		    PRIMARY KEY (user_id),
		    FOREIGN KEY (user_id)
		        REFERENCES user(id)
		        ON DELETE CASCADE
		)
	`);
}
