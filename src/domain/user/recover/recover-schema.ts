import { FastifySchema } from 'fastify';

export const REQUEST_RECOVERY_CODE_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            emailOrUsername: { type: 'string' },
        },
        required: ['emailOrUsername'],
    },
};

export type RequestRecoveryCodePayload = {
    emailOrUsername: string;
};

export const VALIDATE_RECOVERY_CODE_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            emailOrUsername: { type: 'string' },
            recoveryCode: { type: 'string' },
        },
        required: ['emailOrUsername', 'recoveryCode'],
    },
};

export type ValidateRecoveryCodePayload = {
    emailOrUsername: string;
    recoveryCode: string;
};

export const RESET_PASSWORD_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            emailOrUsername: { type: 'string' },
            recoveryCode: { type: 'string' },
            newPassword: { type: 'string' },
        },
        required: ['emailOrUsername', 'recoveryCode', 'newPassword'],
    },
};

export type ResetPasswordPayload = {
    emailOrUsername: string;
    recoveryCode: string;
    newPassword: string;
};
