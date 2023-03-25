import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import { RouteTarget } from "../route-target";

export class HealthController implements RouteTarget {
  public getRoutes(): RouteOptions[] {
    return [{method: 'GET', url: '/health', handler: this.health}];
  }

  public health(request: FastifyRequest, reply: FastifyReply) {
    reply.code(200).send("OK");
  }
}
