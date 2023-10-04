import { Logger } from '../../../general/logger';
import { waitSeconds } from '../../../general/util';
import { ExerciseService } from '../../exercise/exercise-service';
import { RankingTimespans } from '../../ranking/ranking';
import { RankingService } from '../../ranking/ranking-service';
import { MinimalUser } from '../../user/user';
import { UserService } from '../../user/user-service';
import { PushNotificationNobodyMoved } from './notification/push-notification-nobody-moved';
import { PushNotificationService } from './service/push-notification-service';

export class NobodyMovedNotificationHandler {
    constructor(
        private pushNotificationService: PushNotificationService,
        private userService: UserService,
        private exerciseService: ExerciseService,
        private rankingService: RankingService
    ) {}

    public async sendNotifications() {
        Logger.info('Starting to send nobody moved notifications');
        let users = [];
        let batchIndex = 0;
        do {
            Logger.info('Sending nobody moved notification batch', batchIndex);
            users = await this.userService.listUsers(100, batchIndex * 100);
            await this.sendToBatch(users);
            await waitSeconds(1);
            batchIndex++;
        } while (users.length > 0);
        Logger.info('Finished sending nobody moved notifications');
    }

    private async sendToBatch(batch: MinimalUser[]) {
        for (const user of batch) {
            this.sendToUser(user);
        }
    }

    private async sendToUser(user: MinimalUser) {
        const favoriteExercise = await this.exerciseService.getFavoriteExercise(user.id);
        const exerciseRanking = await this.rankingService.getRankedFriendList(user.id, favoriteExercise.id, RankingTimespans.RANKING_1_DAY);
        if (exerciseRanking.some(user => user.score > 0)) {
            return;
        }
        const notification = new PushNotificationNobodyMoved(favoriteExercise);
        this.pushNotificationService.sendNotification(user.id, notification);
    }
}
