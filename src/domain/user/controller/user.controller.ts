import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { FIND_USER_SCHEMA, FindUserParams, LOGIN_SCHEMA, LoginPayload, REGISTER_SCHEMA, RegisterPayload } from './user-schema';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { ConflictError } from '../../../general/server/controller/error/conflict-error';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { ValidationError } from '../../../general/validation-error';
import { UserNotFoundError, WrongPasswordError, UserExistsError } from '../user-error';
import { UserService } from '../user-service';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';
import { authenticate } from '../../../general/server/middleware/authentication';

export class UserController implements RouteTarget {
    constructor(private userService: UserService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            { url: '/user/register', method: 'POST', handler: this.register.bind(this), schema: REGISTER_SCHEMA },
            { url: '/user/login', method: 'POST', handler: this.login.bind(this), schema: LOGIN_SCHEMA },
            {
                url: '/user/find/:query',
                method: 'GET',
                preValidation: authenticate,
                handler: this.find.bind(this),
                schema: FIND_USER_SCHEMA,
            },
        ];
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

    public async find(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const params = request.params as FindUserParams;
        if (params.query.length < 3) {
            throw new BadRequestError('query must be at least 3 characters long');
        }

        const foundUsers = await this.userService.find(params.query);
        reply.status(200).send(foundUsers);
    }
}
