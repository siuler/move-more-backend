import { FastifySchema } from 'fastify';

export const REGISTER_PUSH_NOTIFICATION_TOKEN_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            token: { type: 'string' },
        },
        required: ['token'],
    },
};

export type RegisterPushNotificationTokenPayload = {
    token: string;
};
