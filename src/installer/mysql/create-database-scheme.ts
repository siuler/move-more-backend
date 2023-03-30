import * as applicationConfig from '../../config/config.json';
import { createConnection } from "mysql2/promise";

export function createDatabaseScheme() {
	const connection = createConnection({
		host: applicationConfig.database.host,
		port: applicationConfig.database.port,
		user: applicationConfig.database.user,
	});
}