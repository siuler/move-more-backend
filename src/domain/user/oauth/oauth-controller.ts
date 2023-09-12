import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';

import { LOGIN_WITH_GOOGLE_SCHEMA, LoginWithOAuthPayload, REGISTER_WITH_GOOGLE_SCHEMA, RegisterWithGooglePayload } from './oauth-schema';
import { OAuthService } from './oauth-service';
import { UserNotFoundError } from '../user-error';
import { NotFoundError } from '../../../general/server/controller/error/not-found-error';
import { InvalidProviderError, InvalidTokenError, MissingScopeError } from './oauth-error';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { OAuthProvider } from './provider/oauth-provider';
import { GoogleOAuthProvider } from './provider/google-oauth-provider';
import { AppleOAuthProvider } from './provider/apple-oauth-provider';

export class OAuthController implements RouteTarget {
    constructor(private oauthService: OAuthService) {
        new GoogleOAuthProvider();
        new AppleOAuthProvider();
    }

    public getRoutes(): RouteOptions[] {
        return [
            { url: '/oauth/login', method: 'POST', handler: this.loginWithOAuth.bind(this), schema: LOGIN_WITH_GOOGLE_SCHEMA },
            {
                url: '/oauth/register',
                method: 'POST',
                handler: this.registerWithOAuth.bind(this),
                schema: REGISTER_WITH_GOOGLE_SCHEMA,
            },
        ];
    }

    public async loginWithOAuth(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as LoginWithOAuthPayload;
        try {
            const provider = OAuthProvider.fromName(payload.provider);
            const tokenPair = await this.oauthService.loginWithOAuth(provider, payload.token);
            reply.status(200).send(tokenPair);
        } catch (error) {
            if (error instanceof InvalidProviderError) {
                throw new BadRequestError('the requested oauth provider is not supported');
            } else if (error instanceof InvalidTokenError) {
                throw new BadRequestError('the provided oauth token is invalid');
            } else if (error instanceof UserNotFoundError) {
                throw new NotFoundError('TECHNICAL_USER_NOT_REGISTERED');
            }
            throw error;
        }
    }

    public async registerWithOAuth(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as RegisterWithGooglePayload;
        try {
            const provider = OAuthProvider.fromName(payload.provider);
            const tokenPair = await this.oauthService.registerWithOAuth(provider, payload.token, payload.username);
            reply.status(200).send(tokenPair);
        } catch (error) {
            if (error instanceof InvalidProviderError) {
                throw new BadRequestError('the requested oauth provider is not supported');
            } else if (error instanceof InvalidTokenError) {
                throw new BadRequestError('the provided google oauth token is invalid');
            } else if (error instanceof MissingScopeError) {
                throw new BadRequestError('email access was not provided');
            }
            throw error;
        }
    }
}
