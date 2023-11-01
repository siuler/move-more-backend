import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import {
    IS_USERNAME_AVAILABLE_SCHEMA,
    LOGIN_SCHEMA,
    LoginPayload,
    REGISTER_SCHEMA,
    RegisterPayload,
    IsUsernameAvailableParams,
} from './user-schema';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { ConflictError } from '../../../general/server/controller/error/conflict-error';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { ValidationError } from '../../../general/error';
import { UserNotFoundError, WrongPasswordError, UserExistsError } from '../user-error';
import { UserService } from '../user-service';
import { authenticate } from '../../../general/server/middleware/authentication';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';

export class UserController implements RouteTarget {
    constructor(private userService: UserService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/user/name/:username/status',
                method: 'GET',
                handler: this.isUsernameAvailable.bind(this),
                schema: IS_USERNAME_AVAILABLE_SCHEMA,
            },
            { url: '/user/login', method: 'POST', handler: this.login.bind(this), schema: LOGIN_SCHEMA },
            { url: '/user/register', method: 'POST', handler: this.register.bind(this), schema: REGISTER_SCHEMA },
            { url: '/user', method: 'DELETE', preValidation: authenticate, handler: this.delete.bind(this) },
        ];
    }

    public async isUsernameAvailable(request: FastifyRequest, reply: FastifyReply) {
        const params = request.params as IsUsernameAvailableParams;
        const isAvailable = await this.userService.isUsernameAvailable(params.username);

        reply.status(200).send({ isAvailable });
    }

    public async login(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as LoginPayload;

        try {
            const tokenPair = await this.userService.login(payload.usernameOrEmail, payload.password);
            reply.status(200).send(tokenPair);
        } catch (error: unknown) {
            if (error instanceof UserNotFoundError || error instanceof WrongPasswordError) {
                throw new BadRequestError('username/email or password incorrect');
            }
            throw error;
        }
    }

    public async register(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as RegisterPayload;

        try {
            await this.userService.register(payload.email, payload.username, payload.password);
        } catch (error: unknown) {
            if (error instanceof ValidationError) {
                throw new BadRequestError(error.message);
            }
            if (error instanceof UserExistsError) {
                throw new ConflictError(error.message);
            }
            throw error;
        }

        reply.status(200).send();
    }

    public async delete(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const userId = request.userId;
        try {
            await this.userService.delete(userId);
            reply.status(200).send();
        } catch (error: unknown) {
            if (error instanceof UserNotFoundError) {
                throw new BadRequestError('user not found');
            }
            throw error;
        }
    }
}
