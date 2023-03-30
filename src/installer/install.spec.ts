import { install } from "./install";
import { createDatabaseScheme } from "./mysql/create-database-scheme";

jest.mock('./mysql/create-database-scheme');

describe('install', () => {
	it('should execute mysql setup', () => {
		//given
		//when
		install();

		//then
		expect(createDatabaseScheme).toBeCalledTimes(1);
	});
});