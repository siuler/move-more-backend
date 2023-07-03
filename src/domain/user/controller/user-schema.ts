export const REGISTER_SCHEMA = {
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

export const LOGIN_SCHEMA = {
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

export const FIND_USER_SCHEMA = {
    params: {
        type: 'object',
        properties: {
            query: { type: 'string' },
        },
        required: ['query'],
    },
};

export type FindUserParams = {
    query: string;
};
