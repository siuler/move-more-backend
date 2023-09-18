import { Pool } from 'mysql2/promise';
import { UserId } from '../user/user';
import { DBRankedUser, RankedUser, RankingTimespan } from './ranking';
import { ExerciseId } from '../exercise/exercise';
import { asJavaScriptObject } from '../../repository/mysql/types';

const QUERY_GET_RANKED_FRIEND_LIST = `
    SELECT
        user.id as user_id,
        user.username as username,
        COALESCE(SUM(performed_exercise.repetitions),0) AS score
    FROM user
    LEFT JOIN performed_exercise
        ON performed_exercise.user_id = user.id
            AND performed_exercise.exercise_id = ?
            AND DATE(performed_exercise.timestamp) > DATE_SUB(CURDATE(), INTERVAL ? DAY)
    WHERE
        user.id IN (?)
    GROUP BY user.id
    ORDER BY score DESC
`;

export class RankingRepository {
    constructor(private connectionPool: Pool) {}

    public async rankUserIds(userIds: UserId[], exerciseId: ExerciseId, timespan: RankingTimespan): Promise<RankedUser[]> {
        const [rankedUserList] = await this.connectionPool.query<DBRankedUser[]>(QUERY_GET_RANKED_FRIEND_LIST, [
            exerciseId,
            timespan,
            userIds,
        ]);
        rankedUserList.forEach(rankedUser => (rankedUser.score = +rankedUser.score));
        return rankedUserList.map(asJavaScriptObject);
    }
}
