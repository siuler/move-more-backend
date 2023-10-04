import assert from 'assert';
import { ExerciseId, ExerciseSet } from '../exercise/exercise';
import { FriendService } from '../friend/friend-service';
import { UserId } from '../user/user';
import { RankedUser, RankingTimespan } from './ranking';
import { RankingRepository } from './ranking-repository';

export class RankingService {
    constructor(private rankingRepository: RankingRepository, private friendService: FriendService) {}

    public async getRankedFriendList(userId: UserId, exerciseId: ExerciseId, timespan: RankingTimespan): Promise<RankedUser[]> {
        const friendIds = (await this.friendService.getFriendList(userId)).map(friend => friend.userId);
        const idsToRank = [...friendIds, userId];

        return this.rankingRepository.rankUserIds(idsToRank, exerciseId, timespan);
    }

    /**
     * find all friends whose rank has been overtaken by a specific exerciseSet in a given timeframe.
     * @param exerciseSet the exercise set that was responsible for overtaking the friends
     * @param timespan the rankingTimespan in which the overtaking should be calculated
     */
    public async getOvertakenFriends(exerciseSet: ExerciseSet, timespan: RankingTimespan): Promise<UserId[]> {
        const currentRanking = await this.getRankedFriendList(exerciseSet.userId, exerciseSet.exerciseId, timespan);
        const overtaker = currentRanking.find(rankedUser => rankedUser.userId === exerciseSet.userId);
        assert(overtaker, 'user was not contained in his own ranking list when trying to getOvertakenFriends');

        const scoreAfter = overtaker.score;
        const scoreBefore = scoreAfter - exerciseSet.repetitions;

        const overtakenUsers = currentRanking
            .filter(rankedUser => rankedUser.score > 0 && rankedUser.score >= scoreBefore && rankedUser.score < scoreAfter)
            .map(rankedUser => rankedUser.userId);
        return overtakenUsers;
    }
}
