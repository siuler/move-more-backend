import { anything, makeUniqueDummy } from '../../../jest/util';
import { Friend } from '../friend/friend';
import { FriendService } from '../friend/friend-service';
import { UserId } from '../user/user';
import { RankedUser, RankingTimespan, RankingTimespans } from './ranking';
import { RankingRepository } from './ranking-repository';
import { RankingService } from './ranking-service';

jest.mock('../friend/friend-service');

describe('ranking-service', () => {
    let rankingRepositoryMock: RankingRepository;
    let friendServiceMock: FriendService;
    let rankingService: RankingService;
    beforeEach(() => {
        rankingRepositoryMock = new RankingRepository(anything);
        friendServiceMock = new FriendService(anything, anything, anything);
        rankingService = new RankingService(rankingRepositoryMock, friendServiceMock);
    });
    describe('getRankedFriendList', () => {
        let expectedRankedFriendList: RankedUser[];
        beforeEach(() => {
            const friends: Friend[] = [2, 3].map(userId => ({ userId, username: `user${userId}` }));
            jest.spyOn(friendServiceMock, 'getFriendList').mockResolvedValue(friends);
            expectedRankedFriendList = makeUniqueDummy<RankedUser[]>();
            jest.spyOn(rankingRepositoryMock, 'rankUserIds').mockResolvedValue(expectedRankedFriendList);
        });
        it('should return the ranking of the user and his friends', async () => {
            //given
            const requestedUserId: UserId = 1;
            const expectedExerciseId = 4;

            //when
            const rankedFriendList = await rankingService.getRankedFriendList(
                requestedUserId,
                expectedExerciseId,
                RankingTimespans.RANKING_1_DAY
            );

            //then
            expect(rankedFriendList).toBe(expectedRankedFriendList);
            expect(rankingRepositoryMock.rankUserIds).toBeCalledWith([2, 3, 1], expectedExerciseId, expect.anything());
        });

        it.each(RankingTimespans.values)(
            'should call ranking repository with correct timespan %s days',
            async (expectedTimespan: RankingTimespan) => {
                //when
                const rankedFriendList = await rankingService.getRankedFriendList(1, 1, expectedTimespan);

                //then
                expect(rankedFriendList).toBe(expectedRankedFriendList);
                expect(rankingRepositoryMock.rankUserIds).toBeCalledWith(expect.anything(), expect.anything(), expectedTimespan);
            }
        );
    });
    describe('getOvertakenFriends', () => {});
});
