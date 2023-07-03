import { MysqlConnectionPool } from './mysql-connection-pool';
import { createPool, Pool } from 'mysql2/promise';
import { makeUniqueDummy } from '../../../jest/util';

jest.mock('mysql2/promise');

describe('mySQL connection pool', () => {
    it('should create a new connection pool instance and return it when requested', async () => {
        //given
        const dummyPool = makeUniqueDummy<Pool>();
        jest.mocked(createPool).mockReturnValue(dummyPool);

        //when
        await MysqlConnectionPool.initialize();

        //then
        expect(createPool).toBeCalled();
        expect(MysqlConnectionPool.getInstance()).toBe(dummyPool);
    });
});
