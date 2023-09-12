import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationError } from './authentication-error';
import * as jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthenticatedFastifyRequest } from './authenticated-request';
import { parseJwt } from '../../util';
import { JWT_PRIVATE_KEY } from '../ssl/jwt-key';

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
        jwt.verify(jwtToken, JWT_PRIVATE_KEY, { ignoreExpiration: false });
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
