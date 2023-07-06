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

export const SEND_FRIEND_REQUEST_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            friendId: { type: 'number' },
        },
        required: ['friendId'],
    },
};
export type SendFriendRequestPayload = {
    friendId: number;
};

export const REMOVE_FRIEND_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            friendId: { type: 'number' },
        },
        required: ['friendId'],
    },
};
export type RemoveFriendParams = {
    friendId: number;
};
