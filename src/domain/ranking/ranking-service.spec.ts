import { anything, makeUniqueDummy } from '../../../jest/util';
import { ExerciseSet } from '../exercise/exercise';
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
    describe('getOvertakenFriends', () => {
        it.each([
            [1, []],
            [2, []],
            [5, [2]],
            [6, [2]],
            [8, [2]],
            [10, [2, 3]],
            [11, [2, 3]],
            [110, [2, 3]],
        ])(
            'should return users that have been overtaken by the given exerciseSet with %s repetitions',
            async (repetitions, expectedOvertakenUserIds) => {
                //given
                jest.spyOn(friendServiceMock, 'getFriendList').mockResolvedValue([]);

                const rankingAfterTraining: RankedUser[] = [
                    { userId: 1, username: 'user1', score: 20 },
                    { userId: 2, username: 'user2', score: 15 },
                    { userId: 3, username: 'user3', score: 10 },
                ];
                jest.spyOn(rankingRepositoryMock, 'rankUserIds').mockResolvedValue(rankingAfterTraining);

                const performedExerciseSet: ExerciseSet = {
                    exerciseId: 1,
                    repetitions,
                    userId: 1,
                };

                //when
                const overtakenUsers = await rankingService.getOvertakenFriends(performedExerciseSet, RankingTimespans.RANKING_1_DAY);

                //then
                expect(overtakenUsers).toEqual(expectedOvertakenUserIds);
            }
        );
    });
});
