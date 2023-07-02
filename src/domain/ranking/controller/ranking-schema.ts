import { FastifySchema } from 'fastify';
import { ExerciseId } from '../../exercise/exercise';
import { RequestRankingTimespan } from '../ranking';

export const RANKED_FRIEND_LIST_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            exerciseId: { type: 'number' },
            timepan: { type: 'string' },
        },
        required: ['exerciseId', 'timespan'],
    },
};

export type RankedFriendListParams = {
    exerciseId: ExerciseId;
    timespan: RequestRankingTimespan;
};
