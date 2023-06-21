import { HealthController } from './health.controller';
import { makeMockReply, makeMockRequest } from '../../../../../jest/controller-mocks';

describe('health controller', () => {
    describe('Route Registration', () => {
        it('should return all routes', () => {
            //given
            const healthController = new HealthController();

            //when
            const routes = healthController.getRoutes();

            //then
            expect(routes).toHaveLength(1);
            expect(routes).toContainEqual({ url: '/health', method: 'GET', handler: healthController.health });
        });
    });

    it('should return 200 ok and "ok" in body', async () => {
        //given
        const mockRequest = makeMockRequest();
        const mockReply = makeMockReply();

        const healthController = new HealthController();

        //when
        healthController.health(mockRequest, mockReply);

        //then
        expect(mockReply.code).toBeCalledWith(200);
        expect(mockReply.send).toBeCalledWith('OK');
    });
});
