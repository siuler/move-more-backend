import { FastifySchema } from 'fastify';

export const SEARCH_FRIEND_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            query: { type: 'string' },
        },
        required: ['query'],
    },
};

export type SearchFriendParams = {
    query: string;
};
