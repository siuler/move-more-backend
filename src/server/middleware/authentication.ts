import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticationError } from "./authentication-error";
import * as jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

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
		jwt.verify(jwtToken, 'TODO: USE SSL CERT', {ignoreExpiration: false});
		done();
	} catch(error: unknown) {
		if (error instanceof TokenExpiredError) {
			throw new AuthenticationError('token expired');
		} else if (error instanceof JsonWebTokenError) {
			throw new AuthenticationError('invalid token');
		}
		throw error;
	}
}
