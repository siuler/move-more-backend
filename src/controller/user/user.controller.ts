import { RouteTarget } from "../route-target";
import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";

export class UserController implements RouteTarget {
	public getRoutes(): RouteOptions[] {
		return <RouteOptions[]>[
			{url: '/user/register', method: "POST", handler: this.register}
		];
	}

	public register(request: FastifyRequest, reply: FastifyReply) {

	}
}