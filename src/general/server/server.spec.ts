import { MoveMoreServer } from './server';
import fastify, { FastifyInstance } from 'fastify';
import { makeMockFastifyInstance } from '../../../jest/controller-mocks';
import { RouteTarget } from './controller/route-target';

jest.mock('fastify');

describe('server', () => {
    let mockFastifyInstance: FastifyInstance;
    beforeEach(() => {
        mockFastifyInstance = makeMockFastifyInstance();
        jest.mocked(fastify).mockReturnValue(mockFastifyInstance as any);
    });

    it('should start server on port 8080', async () => {
        //given
        const server = new MoveMoreServer([]);

        //when
        await server.start();

        //then
        expect(fastify).toBeCalledTimes(1);
        expect(fastify).toBeCalledWith({
            keepAliveTimeout: 1000,
        });
        expect(mockFastifyInstance.listen).toBeCalledWith({
            port: 8080,
            host: '0.0.0.0',
        });
    });

    it('should register every route provided by the controllers', async () => {
        //given
        const route1 = { method: 'GET', url: 'doesnt-matter1' };
        const route2 = { method: 'GET', url: 'doesnt-matter2' };
        const route3 = { method: 'POST', url: 'doesnt-matter3' };

        const controller1Routes = [route1];
        const controller2Routes = [route2, route3];

        const controller1 = <RouteTarget>{ getRoutes: () => controller1Routes };
        const controller2 = <RouteTarget>{ getRoutes: () => controller2Routes };

        const server = new MoveMoreServer([controller1, controller2]);

        //when
        await server.start();

        //then
        expect(mockFastifyInstance.route).toBeCalledTimes(3);
        expect(mockFastifyInstance.route).toBeCalledWith(route1);
        expect(mockFastifyInstance.route).toBeCalledWith(route2);
        expect(mockFastifyInstance.route).toBeCalledWith(route3);
    });

    it('should stop server', async () => {
        //given
        const server = new MoveMoreServer([]);
        await server.start();

        //when
        server.stop();

        //then
        expect(mockFastifyInstance.close).toBeCalled();
    });
});
