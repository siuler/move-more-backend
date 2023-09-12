import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';
import {
    REQUEST_RECOVERY_CODE_SCHEMA,
    RESET_PASSWORD_SCHEMA,
    RequestRecoveryCodePayload,
    ResetPasswordPayload,
    VALIDATE_RECOVERY_CODE_SCHEMA,
    ValidateRecoveryCodePayload,
} from './recover-schema';
import { RecoverAccountService } from './recover-service';
import { UserNotFoundError } from '../user-error';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { isRecoveryCode } from './recovery';
import { InvalidRecoveryCodeError } from './recovery-error';
import { ValidationError } from '../../../general/error';
import { NotFoundError } from '../../../general/server/controller/error/not-found-error';

export class RecoverAccountController implements RouteTarget {
    constructor(private recoveryService: RecoverAccountService) {}

    getRoutes(): RouteOptions[] {
        return [
            {
                url: '/recover/request-code',
                method: 'POST',
                handler: this.requestRecoveryCode.bind(this),
                schema: REQUEST_RECOVERY_CODE_SCHEMA,
            },
            {
                url: '/recover/validate-code',
                method: 'POST',
                handler: this.validateRecoveryCode.bind(this),
                schema: VALIDATE_RECOVERY_CODE_SCHEMA,
            },
            {
                url: '/recover/reset-password',
                method: 'POST',
                handler: this.resetPassword.bind(this),
                schema: RESET_PASSWORD_SCHEMA,
            },
        ];
    }

    public async requestRecoveryCode(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as RequestRecoveryCodePayload;
        try {
            await this.recoveryService.sendRecoveryCode(payload.emailOrUsername);
            reply.status(200).send();
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                throw new NotFoundError('there is no user registered with this email or username.');
            }
            throw error;
        }
    }

    public async validateRecoveryCode(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as ValidateRecoveryCodePayload;
        try {
            if (!isRecoveryCode(payload.recoveryCode)) {
                return reply.status(200).send({ valid: false });
            }
            if (!(await this.recoveryService.validateRecoveryCode(payload.emailOrUsername, payload.recoveryCode))) {
                return reply.status(200).send({ valid: false });
            }
            reply.status(200).send({ valid: true });
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                throw new NotFoundError('there is no user registered with this email or username.');
            }
            throw error;
        }
    }

    public async resetPassword(request: FastifyRequest, reply: FastifyReply) {
        const payload = request.body as ResetPasswordPayload;
        try {
            if (!isRecoveryCode(payload.recoveryCode)) {
                throw new InvalidRecoveryCodeError();
            }
            await this.recoveryService.resetPassword(payload.emailOrUsername, payload.recoveryCode, payload.newPassword);
            reply.status(200).send();
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                throw new NotFoundError('there is no user with this email or username');
            } else if (error instanceof InvalidRecoveryCodeError) {
                throw new BadRequestError('the provided recovery code is invalid');
            } else if (error instanceof ValidationError) {
                throw new BadRequestError(error.message);
            }
            throw error;
        }
    }
}
