import { InternalEventBus } from '../../../general/internal-event/event-bus';
import { ExerciseAbsolvedInternalEvent } from '../../exercise/exercise-absolved-internal-event';
import { ExerciseService } from '../../exercise/exercise-service';
import { RankingTimespans } from '../../ranking/ranking';
import { RankingService } from '../../ranking/ranking-service';
import { UserService } from '../../user/user-service';
import { PushNotification } from './push-notification';
import { PushNotificationService } from './service/push-notification-service';

export class PushNotificationInternalEventListener {
    constructor(
        private rankingService: RankingService,
        private pushNotificationService: PushNotificationService,
        private exerciseService: ExerciseService,
        private userService: UserService
    ) {
        InternalEventBus.on('exercise-absolved', this.handleExerciseAbsolved.bind(this));
    }

    private async handleExerciseAbsolved(event: ExerciseAbsolvedInternalEvent) {
        const overtakenUsersIds = await this.rankingService.getOvertakenFriends(event.data, RankingTimespans.RANKING_1_DAY);
        const exercise = await this.exerciseService.findById(event.data.exerciseId);
        const username = await this.userService.getUsername(event.data.userId);
        const notification = new PushNotification(`MoveMore ${exercise.pluralizedName}`, `You have been overtaken by ${username}`, {
            exerciseId: event.data.exerciseId.toString(),
        });

        for (const overtakenUserId of overtakenUsersIds) {
            this.pushNotificationService.sendNotification(overtakenUserId, notification);
        }
    }
}
