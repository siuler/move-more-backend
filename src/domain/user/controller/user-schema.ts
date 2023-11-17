import { FastifySchema } from 'fastify';

export const LOGIN_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            usernameOrEmail: { type: 'string' },
            password: { type: 'string' },
        },
        required: ['usernameOrEmail', 'password'],
    },
};

export type LoginPayload = {
    usernameOrEmail: string;
    password: string;
};

export const REGISTER_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            email: { type: 'string' },
            username: { type: 'string' },
            password: { type: 'string' },
        },
        required: ['email', 'username', 'password'],
    },
};

export type RegisterPayload = {
    username: string;
    email: string;
    password: string;
};

export const IS_USERNAME_AVAILABLE_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            username: { type: 'string' },
        },
        required: ['username'],
    },
};

export type IsUsernameAvailableParams = {
    username: string;
};

export const IS_EMAIL_AVAILABLE_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            email: { type: 'string' },
        },
        required: ['email'],
    },
};

export type IsEmailAvailableParams = {
    email: string;
};
