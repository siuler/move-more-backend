import { RouteTarget } from '../route-target';
import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { LOGIN_SCHEMA, REGISTER_SCHEMA } from './user-schema';
import { UserService } from '../../service/user/user-service';
import { BadRequestError } from '../error/bad-request-error';
import { ConflictError } from '../error/conflict-error';
import { ValidationError } from '../../general/validation-error';
import { LoginPayload, RegisterPayload } from '../../domain/user/user';
import { UserExistsError, UserNotFoundError, WrongPasswordError } from '../../domain/user/user-error';

export class UserController implements RouteTarget {
    constructor(private userService: UserService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            { url: '/user/register', method: 'POST', handler: this.register.bind(this), schema: REGISTER_SCHEMA },
            { url: '/user/login', method: 'POST', handler: this.login.bind(this), schema: LOGIN_SCHEMA },
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
}
