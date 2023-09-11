import { FastifySchema } from 'fastify';

export const LOGIN_WITH_GOOGLE_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            token: { type: 'string' },
            provider: { type: 'string' },
        },
        required: ['token', 'provider'],
    },
};

export type LoginWithOAuthPayload = {
    token: string;
    provider: string;
};

export const REGISTER_WITH_GOOGLE_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            token: { type: 'string' },
            username: { type: 'string' },
            provider: { type: 'string' },
        },
        required: ['token', 'username', 'provider'],
    },
};

export type RegisterWithGooglePayload = {
    token: string;
    username: string;
    provider: string;
};
