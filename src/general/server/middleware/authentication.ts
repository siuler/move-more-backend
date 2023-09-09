import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationError } from './authentication-error';
import * as jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthenticatedFastifyRequest } from './authenticated-request';

export function authenticate(request: FastifyRequest, reply: FastifyReply, done: () => void) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw new AuthenticationError('authorization header is missing');
    }
    if (!authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('wrong authorization header format');
    }

    const jwtToken = authHeader.replace('Bearer ', '');
    try {
        jwt.verify(jwtToken, 'TODO: USE SSL CERT', { ignoreExpiration: false });
        extendFastifyRequest(jwtToken, request);
        done();
    } catch (error: unknown) {
        if (error instanceof TokenExpiredError) {
            throw new AuthenticationError('token expired');
        } else if (error instanceof JsonWebTokenError || error instanceof SyntaxError) {
            throw new AuthenticationError('invalid token');
        }
        throw error;
    }
}

function extendFastifyRequest(jwtToken: string, request: FastifyRequest) {
    const payload = parseJwt(jwtToken);
    if (!payload || !payload.uid) {
        throw new AuthenticationError('token payload does not contain uid');
    }
    (request as AuthenticatedFastifyRequest).userId = payload.uid;
}

function parseJwt(token: string) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}
