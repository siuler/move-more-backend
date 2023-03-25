import fastify, { FastifyInstance } from "fastify";
import { RouteTarget } from "../controller/route-target";

export class MoveMoreServer {
    private fastifyInstance?: FastifyInstance;

    constructor(private routeTargets: RouteTarget[]) {}

    public async start() {
        const fastifyInstance = await fastify({});
        await fastifyInstance.listen({port: 8080, host: '0.0.0.0'});

        this.fastifyInstance = fastifyInstance;

        this.registerRoutes(fastifyInstance);
    }

    private registerRoutes(fastifyInstance: FastifyInstance) {
        this.routeTargets
            .map(routeTarget => routeTarget.getRoutes())
            .flat()
            .forEach(routeDefinition => {
                fastifyInstance.route(routeDefinition);
            });
    }
}
