import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';
import { InvalidTimespanError } from '../../general/error';

export interface RankedUser extends RowDataPacket {
    id: UserId;
    username: string;
    score: number;
}

export type RankingTimespan = number;

export type RequestRankingTimespan = '1day' | '7days' | '30days';

export class RankingTimespans {
    static RANKING_1_DAY: RankingTimespan = 60 * 60 * 24;
    static RANKING_7_DAYS: RankingTimespan = 60 * 60 * 24 * 7;
    static RANKING_30_DAYS: RankingTimespan = 60 * 60 * 24 * 30;

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
