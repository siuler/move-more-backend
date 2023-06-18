import { MysqlConnectionPool } from './mysql-connection-pool';
import { createPool, Pool, PoolOptions } from 'mysql2/promise';
import { makeUniqueDummy } from '../../../jest/util';

jest.mock('mysql2/promise');

describe('mySQL connection pool', () => {
    it('should create a new connection pool instance and return it when requested', async () => {
        //given
        const dummyPool = makeUniqueDummy<Pool>();
        jest.mocked(createPool).mockReturnValue(dummyPool);

        const dummyPoolOptions = makeUniqueDummy<PoolOptions>();

        //when
        await MysqlConnectionPool.initialize(dummyPoolOptions);

        //then
        expect(createPool).toBeCalledWith(dummyPoolOptions);
        expect(MysqlConnectionPool.getInstance()).toBe(dummyPool);
    });
});
