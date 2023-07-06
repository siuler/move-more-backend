import { RouteOptions, FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { InvalidTokenError, TokenNotFoundError } from '../token-error';
import { TokenService } from '../token-service';
import { REFRESH_TOKEN_SCHEMA, RefreshTokenPayload } from './token-schema';

export class TokenController implements RouteTarget {
    constructor(private tokenService: TokenService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            { url: '/token/refresh', method: 'POST', handler: this.refreshToken.bind(this), schema: REFRESH_TOKEN_SCHEMA },
        ];
    }

    public async refreshToken(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as RefreshTokenPayload;

        try {
            const tokenPair = await this.tokenService.refreshToken(payload.userId, payload.refreshToken);
            reply.status(200).send(tokenPair);
        } catch (error: unknown) {
            if (error instanceof InvalidTokenError || error instanceof TokenNotFoundError) {
                throw new BadRequestError('refresh token is invalid');
            }
            throw error;
        }
    }
}
