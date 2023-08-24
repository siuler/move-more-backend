import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';

import { LOGIN_WITH_GOOGLE_SCHEMA, LoginWithGooglePayload, REGISTER_WITH_GOOGLE_SCHEMA, RegisterWithGooglePayload } from './oauth-schema';
import { OAuthService } from './oauth-service';
import { UserNotFoundError } from '../user-error';
import { NotFoundError } from '../../../general/server/controller/error/not-found-error';
import { InvalidTokenError, MissingScopeError } from './oauth-error';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';

export class OAuthController implements RouteTarget {
    constructor(private oauthService: OAuthService) {}

    public getRoutes(): RouteOptions[] {
        return [
            { url: '/oauth/google', method: 'POST', handler: this.loginWithGoogle.bind(this), schema: LOGIN_WITH_GOOGLE_SCHEMA },
            {
                url: '/oauth/google/register',
                method: 'POST',
                handler: this.registerWithGoogle.bind(this),
                schema: REGISTER_WITH_GOOGLE_SCHEMA,
            },
        ];
    }

    public async loginWithGoogle(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as LoginWithGooglePayload;
        try {
            const tokenPair = this.oauthService.loginWithGoogle(payload.token);
            reply.status(200).send(tokenPair);
        } catch (error) {
            if (error instanceof InvalidTokenError) {
                throw new BadRequestError('the provided google oauth token is invalid');
            } else if (error instanceof UserNotFoundError) {
                throw new NotFoundError('TECHNICAL_USER_NOT_REGISTERED');
            }
            throw error;
        }
    }

    public async registerWithGoogle(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as RegisterWithGooglePayload;
        try {
            const userId = this.oauthService.registerWithGoogle(payload.token, payload.username);
            reply.status(200).send(userId);
        } catch (error) {
            if (error instanceof InvalidTokenError) {
                throw new BadRequestError('the provided google oauth token is invalid');
            } else if (error instanceof MissingScopeError) {
                throw new BadRequestError('email access was not provided');
            }
            throw error;
        }
    }
}
