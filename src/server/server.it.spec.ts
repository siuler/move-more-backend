import { HealthController } from '../controller/health/health.controller';
import fetch from 'node-fetch';
import { MoveMoreServer } from './server';
import { FastifyReply, FastifyRequest } from 'fastify';

describe('server - this test ensures that the server actually calls the controllers when routes are requested', () => {
    it('should register health endpoint', async () => {
        //given
        const healthController = new HealthController();
        const healthSpy = jest.spyOn(healthController, 'health').mockImplementation((request: FastifyRequest, reply: FastifyReply) => {
            reply.code(200).send();
        });
        await new MoveMoreServer([healthController]).start();

        //when
        await fetch('http://0.0.0.0:8080/health');

        //then
        expect(healthSpy).toBeCalledTimes(1);
    });
});
