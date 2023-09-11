import fastify, { FastifyInstance } from 'fastify';
import { RouteTarget } from './controller/route-target';
import { fastifyErrorHandler } from './middleware/error-handler';
import * as fs from 'fs';
import * as path from 'path';

export class MoveMoreServer {
    private fastifyInstance: FastifyInstance;

    constructor(private routeTargets: RouteTarget[]) {
        const key = fs.readFileSync(path.join(__dirname, 'ssl', 'fastify.key'));
        const cert = fs.readFileSync(path.join(__dirname, 'ssl', 'fastify.cert'));

        this.fastifyInstance = fastify({
            keepAliveTimeout: 1000,
            https: {
                key,
                cert,
            },
        });
        this.fastifyInstance.setErrorHandler(fastifyErrorHandler);
        this.registerRoutes();
    }

    public async start() {
        await this.fastifyInstance.listen({ port: 8080, host: '0.0.0.0' });
    }

    public async stop() {
        await this.fastifyInstance.close();
    }

    private registerRoutes() {
        this.routeTargets
            .map(routeTarget => routeTarget.getRoutes())
            .flat()
            .forEach(routeDefinition => {
                this.fastifyInstance.route(routeDefinition);
            });
    }
}
