import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';
import { InvalidTimespanError } from '../../general/error';
import { JavaScriptObject } from '../../repository/mysql/types';

export interface DBRankedUser extends RowDataPacket {
    user_id: UserId;
    username: string;
    score: number;
}

export type RankedUser = JavaScriptObject<DBRankedUser>;

export type RankingTimespan = number;

export type RequestRankingTimespan = '1day' | '7days' | '30days';

export class RankingTimespans {
    static RANKING_1_DAY: RankingTimespan = 1;
    static RANKING_7_DAYS: RankingTimespan = 7;
    static RANKING_30_DAYS: RankingTimespan = 30;

    static values: RankingTimespan[] = [this.RANKING_1_DAY, this.RANKING_7_DAYS, this.RANKING_30_DAYS];

    public static fromRequestTimespan(timespan: RequestRankingTimespan): RankingTimespan {
        switch (timespan) {
            case '1day':
                return this.RANKING_1_DAY;
            case '7days':
                return this.RANKING_7_DAYS;
            case '30days':
                return this.RANKING_30_DAYS;
            default:
                throw new InvalidTimespanError();
        }
    }
}
