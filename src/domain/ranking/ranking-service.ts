import { ExerciseId } from '../exercise/exercise';
import { FriendService } from '../friend/friend-service';
import { UserId } from '../user/user';
import { RankedUser, RankingTimespan } from './ranking';
import { RankingRepository } from './ranking-repository';

export class RankingService {
    constructor(private rankingRepository: RankingRepository, private friendService: FriendService) {}

    public async getRankedFriendList(userId: UserId, exerciseId: ExerciseId, timespan: RankingTimespan): Promise<RankedUser[]> {
        const friendIds = (await this.friendService.getFriendList(userId)).map(friend => friend.user_id);
        const idsToRank = [...friendIds, userId];

        return this.rankingRepository.rankUserIds(idsToRank, exerciseId, timespan);
    }
}
