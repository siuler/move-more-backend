import { FastifySchema } from 'fastify';

export const LOGIN_WITH_GOOGLE_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            token: { type: 'string' },
        },
        required: ['token'],
    },
};

export type LoginWithGooglePayload = {
    token: string;
};

export const REGISTER_WITH_GOOGLE_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            token: { type: 'string' },
            username: { type: 'string' },
        },
        required: ['token', 'username'],
    },
};

export type RegisterWithGooglePayload = LoginWithGooglePayload & { username: string };
