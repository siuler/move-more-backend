import { Pool } from 'mysql2/promise';
import { UserId } from '../user/user';
import { DBRankedUser, RankedUser } from './ranking';
import { ExerciseId } from '../exercise/exercise';
import { Seconds } from '../../general/types';
import { asJavaScriptObject } from '../../repository/mysql/types';

const QUERY_GET_RANKED_FRIEND_LIST = `
    SELECT 
        user.id as user_id,
        user.username as username,
        SUM(performed_exercise.repetitions) AS score
    FROM performed_exercise
    LEFT JOIN user
        ON user.id = performed_exercise.user_id
    WHERE 
        performed_exercise.user_id IN (?)
        AND performed_exercise.exercise_id = ?
        AND performed_exercise.timestamp > NOW() - INTERVAL ? SECOND
    GROUP BY performed_exercise.user_id
`;

export class RankingRepository {
    constructor(private connectionPool: Pool) {}

    public async rankUserIds(userIds: UserId[], exerciseId: ExerciseId, timespanInSeconds: Seconds): Promise<RankedUser[]> {
        const [rankedUserList] = await this.connectionPool.query<DBRankedUser[]>(QUERY_GET_RANKED_FRIEND_LIST, [
            userIds,
            exerciseId,
            timespanInSeconds,
        ]);

        return rankedUserList.map(asJavaScriptObject);
    }
}
