import { Pool } from 'mysql2/promise';
import { DBStatisticPacketItem, StatisticPacket, StatisticPacketMeta, StatisticTimespan } from './statistic';
import { InvalidTimespanError } from '../../general/error';
import { asJavaScriptObject } from '../../repository/mysql/types';
import { UserId } from '../user/user';

const statisticPacketSize = 10;

function buildStatsQuery(periodStartDateClause: string, intervalName: 'DAY' | 'WEEK' | 'MONTH') {
    return `
        SELECT 
            SUM(repetitions) AS score, 
            (${periodStartDateClause}) AS period_start_date
        FROM performed_exercise
        WHERE user_id = ? 
            AND exercise_id = ?
            AND timestamp < COALESCE(?, NOW())
            AND timestamp > DATE_SUB(COALESCE(?, NOW()), INTERVAL ${statisticPacketSize} ${intervalName})
        GROUP BY period_start_date
        ORDER BY timestamp DESC
        LIMIT ${statisticPacketSize}
    `;
}

const QUERY_GET_STATS_DAILY = buildStatsQuery('DATE(timestamp)', 'DAY');
const QUERY_GET_STATS_WEEKLY = buildStatsQuery('DATE_SUB(DATE(timestamp), INTERVAL WEEKDAY(timestamp) DAY)', 'WEEK');
const QUERY_GET_STATS_MONTHLY = buildStatsQuery('DATE_SUB(DATE(timestamp), INTERVAL DAYOFMONTH(timestamp)-1 DAY)', 'MONTH');

export class StatisticRepository {
    constructor(private connectionPool: Pool) {}

    public async getStats(userId: UserId, metadata: StatisticPacketMeta): Promise<StatisticPacket> {
        const query = this.getQueryForTimespan(metadata.timespan);

        const [statisticPacketItems] = await this.connectionPool.query<DBStatisticPacketItem[]>(query, [
            userId,
            metadata.exerciseId,
            metadata.firstDateNotToInclude ?? null,
            metadata.firstDateNotToInclude ?? null,
        ]);
        const items = statisticPacketItems.map(asJavaScriptObject);
        items.forEach(item => (item.score = +item.score));
        return items;
    }

    private getQueryForTimespan(timespan: StatisticTimespan) {
        switch (timespan) {
            case 'day':
                return QUERY_GET_STATS_DAILY;
            case 'week':
                return QUERY_GET_STATS_WEEKLY;
            case 'month':
                return QUERY_GET_STATS_MONTHLY;
            default:
                throw new InvalidTimespanError();
        }
    }
}
