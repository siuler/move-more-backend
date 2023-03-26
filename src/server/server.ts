import fastify, { FastifyInstance } from "fastify";
import { RouteTarget } from "../controller/route-target";

export class MoveMoreServer {
    private fastifyInstance: FastifyInstance;

    constructor(private routeTargets: RouteTarget[]) {
        this.fastifyInstance = fastify({
            keepAliveTimeout: 10000,
        });
        this.registerRoutes();
    }

    public async start() {
        await this.fastifyInstance.listen({port: 8080, host: '0.0.0.0'});
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
