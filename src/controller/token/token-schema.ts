export const REFRESH_TOKEN_SCHEMA = {
    body: {
        type: 'object',
        properties: {
            refreshToken: { type: 'string' },
            userId: { type: 'number' },
        },
        required: ['refreshToken', 'userId'],
    },
};
