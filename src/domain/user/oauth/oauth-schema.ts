import { FastifySchema } from 'fastify';

export const LOGIN_WITH_GOOGLE_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            token: { type: 'string' },
            email: { type: 'string' },
        },
        required: ['token', 'email'],
    },
};

export type LoginWithGooglePayload = {
    token: string;
    email: string;
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

export type RegisterWithGooglePayload = {
    token: string;
    username: string;
};
