import { Pool } from 'mysql2/promise';
import { DBStatisticPacketItem, StatisticPacket, StatisticPacketMeta, StatisticTimespan } from './statistic';
import { InvalidTimespanError } from '../../general/error';
import { asJavaScriptObject } from '../../repository/mysql/types';
import { UserId } from '../user/user';

function buildStatsQuery(periodStartDateClause: string) {
    return `
        SELECT 
            SUM(repetitions) AS score, 
            (${periodStartDateClause}) AS period_start_date
        FROM performed_exercise
        WHERE user_id = ? 
            AND exercise_id = ?
            AND timestamp < COALESCE(?, NOW())
        GROUP BY period_start_date
        ORDER BY timestamp DESC
        LIMIT 10
    `;
}

const QUERY_GET_STATS_DAILY = buildStatsQuery('DATE(timestamp)');
const QUERY_GET_STATS_WEEKLY = buildStatsQuery('DATE_SUB(DATE(timestamp), INTERVAL WEEKDAY(timestamp) DAY)');
const QUERY_GET_STATS_MONTHLY = buildStatsQuery('DATE_SUB(DATE(timestamp), INTERVAL DAYOFMONTH(timestamp)-1 DAY)');

export class StatisticRepository {
    constructor(private connectionPool: Pool) {}

    public async getStats(userId: UserId, metadata: StatisticPacketMeta): Promise<StatisticPacket> {
        const query = this.getQueryForTimespan(metadata.timespan);

        const [statisticPacketItems] = await this.connectionPool.query<DBStatisticPacketItem[]>(query, [
            userId,
            metadata.exerciseId,
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
