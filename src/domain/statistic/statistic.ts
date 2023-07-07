import { RowDataPacket } from 'mysql2';
import { ExerciseId } from '../exercise/exercise';
import { UserId } from '../user/user';
import { JavaScriptObject } from '../../repository/mysql/types';

export type StatisticTimespan = 'day' | 'week' | 'month';
export type DateString = `${number}-${number}-${number}`;

export type StatisticPacketMeta = {
    timespan: StatisticTimespan;
    userId: UserId;
    exerciseId: ExerciseId;
    firstDateNotToInclude: DateString;
};

export interface DBStatisticPacketItem extends RowDataPacket {
    score: number;
    period_start_time: string;
}

export type StatisticPacketItem = JavaScriptObject<DBStatisticPacketItem>;
export type StatisticPacket = StatisticPacketItem[];
