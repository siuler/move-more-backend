import { FastifyRequest } from 'fastify';
import { UserId } from '../../../domain/user/user';

export type AuthenticatedFastifyRequest = FastifyRequest & { userId: UserId };
