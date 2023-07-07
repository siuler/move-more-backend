import { FastifySchema } from 'fastify';
import { ExerciseId } from '../../exercise/exercise';
import { DateString, StatisticTimespan } from '../statistic';
import { UserId } from '../../user/user';

export const STATISTIC_PACKET_SCHEMA: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            exerciseId: { type: 'number' },
        },
        required: ['exerciseId'],
    },
    querystring: {
        type: 'object',
        properties: {
            comparedUser: { type: 'number' },
            timespan: { type: 'string' },
            firstKnown: { type: 'string' },
        },
        required: ['comparedUser', 'timespan'],
    },
};

export type StatisticPacketParams = { exerciseId: ExerciseId };
export type StatisticPacketQueryParams = { timespan: StatisticTimespan; comparedUser: UserId; firstKnown?: DateString };
