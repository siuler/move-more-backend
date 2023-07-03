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
