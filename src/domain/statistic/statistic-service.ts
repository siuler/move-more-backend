import { UserId } from '../user/user';
import { StatisticRepository } from './statistic-repository';
import { StatisticPacketMeta, MultiUserStatisticPacket } from './statistic';

export class StatisticService {
    constructor(private statisticRepository: StatisticRepository) {}

    public async getStatisticsForUsers(userIds: UserId[], metadata: StatisticPacketMeta): Promise<MultiUserStatisticPacket> {
        return Promise.all(
            userIds.map(async userId => ({
                userId,
                statistics: await this.statisticRepository.getStats(userId, metadata),
            }))
        );
    }
}
