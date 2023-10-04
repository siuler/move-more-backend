import { InternalEventBus } from '../../../general/internal-event/event-bus';
import { Exercise } from '../../exercise/exercise';
import { ExerciseAbsolvedInternalEvent } from '../../exercise/exercise-absolved-internal-event';
import { ExerciseService } from '../../exercise/exercise-service';
import { FriendRequestAcceptedInternalEvent } from '../../exercise/friend-request-accepted-internal-event';
import { FriendRequestSentInternalEvent } from '../../exercise/friend-request-sent-internal-event';
import { RankingTimespans } from '../../ranking/ranking';
import { RankingService } from '../../ranking/ranking-service';
import { UserService } from '../../user/user-service';
import { PushNotificationFriendAlreadyWorkedOut } from './notification/push-notification-friend-already-worked-out';
import { PushNotificationFriendRequestAccepted } from './notification/push-notification-friend-request-accepted';
import { PushNotificationFriendRequestReceived } from './notification/push-notification-friend-request-received';
import { PushNotificationOvertakenByFriend } from './notification/push-notification-overtaken-by-friend';
import { PushNotificationService } from './service/push-notification-service';

export class PushNotificationInternalEventListener {
    constructor(
        private rankingService: RankingService,
        private pushNotificationService: PushNotificationService,
        private exerciseService: ExerciseService,
        private userService: UserService
    ) {
        InternalEventBus.on('friend-request-sent', this.handleFriendRequestSent.bind(this));
        InternalEventBus.on('friend-request-accepted', this.handleFriendRequestAccepted.bind(this));
        InternalEventBus.on('exercise-absolved', this.handleExerciseAbsolved.bind(this));
    }

    private async handleFriendRequestSent(event: FriendRequestSentInternalEvent) {
        const senderUsername = await this.userService.getUsername(event.data.senderId);
        const notification = new PushNotificationFriendRequestReceived(senderUsername);
        this.pushNotificationService.sendNotification(event.data.receiverId, notification);
    }

    private async handleFriendRequestAccepted(event: FriendRequestAcceptedInternalEvent) {
        const receiverUsername = await this.userService.getUsername(event.data.receiverId);
        const notification = new PushNotificationFriendRequestAccepted(receiverUsername);
        this.pushNotificationService.sendNotification(event.data.senderId, notification);
    }

    private async handleExerciseAbsolved(event: ExerciseAbsolvedInternalEvent) {
        const exercise = await this.exerciseService.findById(event.data.exerciseId);
        const username = await this.userService.getUsername(event.data.userId);
        this.handleOvertakenByFriendNotifications(event, exercise, username);
        this.handleFriendAlreadyWorkedOutNotifications(event, exercise, username);
    }

    private async handleOvertakenByFriendNotifications(event: ExerciseAbsolvedInternalEvent, exercise: Exercise, username: string) {
        const overtakenUsersIds = await this.rankingService.getOvertakenFriends(event.data, RankingTimespans.RANKING_1_DAY);
        const notification = new PushNotificationOvertakenByFriend(exercise, username);

        for (const overtakenUserId of overtakenUsersIds) {
            this.pushNotificationService.sendNotification(overtakenUserId, notification);
        }
    }

    private async handleFriendAlreadyWorkedOutNotifications(event: ExerciseAbsolvedInternalEvent, exercise: Exercise, username: string) {
        const ranking = await this.rankingService.getRankedFriendList(
            event.data.userId,
            event.data.exerciseId,
            RankingTimespans.RANKING_1_DAY
        );
        const friendsThatDidNotWorkOut = ranking.filter(friend => friend.score == 0);

        const notification = new PushNotificationFriendAlreadyWorkedOut(exercise, username, event.data.repetitions);
        friendsThatDidNotWorkOut.forEach(friend =>
            this.pushNotificationService.sendNotificationWithoutSpam(1, friend.userId, notification)
        );
    }
}
