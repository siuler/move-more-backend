import { FastifyReply, RouteOptions } from 'fastify';
import { RouteTarget } from '../../../../general/server/controller/route-target';
import { AuthenticatedFastifyRequest } from '../../../../general/server/middleware/authenticated-request';
import { authenticate } from '../../../../general/server/middleware/authentication';
import { REGISTER_PUSH_NOTIFICATION_TOKEN_SCHEMA, RegisterPushNotificationTokenPayload } from './push-notification-schema';
import { PushNotificationService } from '../service/push-notification-service';
import { PushNotificationTokenAlreadyExistsError, PushNotificationTokenTooLongError } from '../push-notification-error';
import { BadRequestError } from '../../../../general/server/controller/error/bad-request-error';
import { TECHNICAL_DEVICE_TOKEN_ALREADY_REGISTERED } from '../../../../general/server/technical-errors';

export class PushNotificationController implements RouteTarget {
    constructor(private pushNotificationService: PushNotificationService) {}

    getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/notification/token',
                method: 'POST',
                preValidation: authenticate,
                handler: this.registerPushNotificationToken.bind(this),
                schema: REGISTER_PUSH_NOTIFICATION_TOKEN_SCHEMA,
            },
        ];
    }

    public async registerPushNotificationToken(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const payload = request.body as RegisterPushNotificationTokenPayload;
        try {
            await this.pushNotificationService.storeToken(request.userId, payload.token);
            reply.status(200).send();
        } catch (e) {
            if (e instanceof PushNotificationTokenTooLongError) {
                throw new BadRequestError('the provided token is too long');
            } else if (e instanceof PushNotificationTokenAlreadyExistsError) {
                throw new BadRequestError(TECHNICAL_DEVICE_TOKEN_ALREADY_REGISTERED);
            }
            throw e;
        }
    }
}
