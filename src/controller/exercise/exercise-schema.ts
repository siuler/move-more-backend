import { FastifySchema } from 'fastify';

export const TRAINING_ABSOLVED_SCHEMA: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            repetitions: { type: 'number' },
        },
        required: ['repetitions'],
    },
    params: {
        type: 'object',
        properties: {
            exerciseId: { type: 'number' },
        },
        required: ['exerciseId'],
    },
};
