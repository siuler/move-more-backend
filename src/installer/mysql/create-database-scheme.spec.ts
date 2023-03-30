import { createDatabaseScheme } from "./create-database-scheme";
import { Connection, createConnection } from "mysql2/promise";
import * as applicationConfig from "../../config/config.json";
import * as fs from "fs";
import { Readable } from "stream";
import { makeUniqueDummy } from "../../../jest/util";

jest.mock("mysql2/promise");

describe('create database scheme', () => {
	it('should open mysql connection and execute the init sql script', () => {
		//given
		const dummySQL = 'SOME DUMMY SQL';
		jest.spyOn(fs, 'readFileSync').mockReturnValue(Readable.from(dummySQL));

		const dummyConnection = makeUniqueDummy<Connection>();
		dummyConnection.query = jest.fn();
		jest.mocked(createConnection).mockReturnValue(dummyConnection);

		//when
		createDatabaseScheme();

		//then
		expect(createConnection).toBeCalledWith({
			host: applicationConfig.database.host,
			port: applicationConfig.database.port,
			user: applicationConfig.database.user,
		});
		expect(dummyConnection.query).toBeCalledWith(dummySQL); //TODO implement multi line semicolon splitting oder so
	});
});