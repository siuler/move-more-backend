import { FastifySchema } from 'fastify';
import { FriendAddToken } from '../friend';

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

export const REJECT_FRIEND_REQUEST_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            rejectedUserId: { type: 'number' },
        },
        required: ['rejectedUserId'],
    },
};
export type RejectFriendRequestParams = {
    rejectedUserId: number;
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

export const REDEEM_FRIEND_ADD_TOKEN_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            token: { type: 'string' },
        },
        required: ['token'],
    },
};
export type RedeemFriendAddtokenParams = {
    token: FriendAddToken;
};
