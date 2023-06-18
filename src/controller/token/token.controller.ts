import { RouteTarget } from "../route-target";
import { FastifyReply, FastifyRequest, RouteOptions } from "fastify";
import { RefreshTokenPayload } from "../../domain/user/user";
import { REFRESH_TOKEN_SCHEMA } from "./token-schema";
import { TokenService } from "../../service/user/token-service";
import { BadRequestError } from "../error/bad-request-error";
import { InvalidTokenError, TokenNotFoundError } from "../../domain/token/token-error";

export class TokenController implements RouteTarget {
	constructor(private tokenService: TokenService) {}

	public getRoutes(): RouteOptions[] {
		return <RouteOptions[]>[
			{url: '/token/refresh', method: "POST", handler: this.refreshToken.bind(this), schema: REFRESH_TOKEN_SCHEMA},
		];
	}

	public async refreshToken(request: FastifyRequest, reply: FastifyReply) {
		const payload = request.body as RefreshTokenPayload;

		try {
			const tokenPair = await this.tokenService.refreshToken(payload.userId, payload.refreshToken);
			reply.status(200).send(tokenPair);
		} catch (error: any) {
			if (error instanceof InvalidTokenError || error instanceof TokenNotFoundError) {
				throw new BadRequestError('refresh token is invalid');
			}
			throw error;
		}
	}
}