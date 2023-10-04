import { InternalEventBus } from '../../../general/internal-event/event-bus';
import { Exercise } from '../../exercise/exercise';
import { ExerciseAbsolvedInternalEvent } from '../../exercise/event/exercise-absolved-internal-event';
import { ExerciseService } from '../../exercise/exercise-service';
import { FriendRequestAcceptedInternalEvent } from '../../friend/event/friend-request-accepted-internal-event';
import { RankingTimespans } from '../../ranking/ranking';
import { RankingService } from '../../ranking/ranking-service';
import { UserService } from '../../user/user-service';
import { NobodyMovedNotificationHandler } from './nobody-moved-notification-handler';
import { PushNotificationFirstFriendMoved } from './notification/push-notification-first-friend-moved';
import { PushNotificationFriendRequestAccepted } from './notification/push-notification-friend-request-accepted';
import { PushNotificationFriendRequestReceived } from './notification/push-notification-friend-request-received';
import { PushNotificationOvertakenByFriend } from './notification/push-notification-overtaken-by-friend';
import { PushNotificationService } from './service/push-notification-service';
import { FriendRequestSentInternalEvent } from '../../friend/event/friend-request-sent-internal-event';

export class PushNotificationInternalEventListener {
    constructor(
        private rankingService: RankingService,
        private pushNotificationService: PushNotificationService,
        private exerciseService: ExerciseService,
        private userService: UserService
    ) {
        const nobodyMovedNotificationHandler = new NobodyMovedNotificationHandler(
            pushNotificationService,
            userService,
            exerciseService,
            rankingService
        );
        InternalEventBus.on(
            'nobody-moved-notification-time',
            nobodyMovedNotificationHandler.sendNotifications.bind(nobodyMovedNotificationHandler)
        );

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
        this.sendOvertakenByFriendNotifications(event, exercise, username);
        this.sendFirstFriendMovedNotifications(event, exercise, username);
    }

    private async sendOvertakenByFriendNotifications(event: ExerciseAbsolvedInternalEvent, exercise: Exercise, username: string) {
        const overtakenUsersIds = await this.rankingService.getOvertakenFriends(event.data, RankingTimespans.RANKING_1_DAY);
        const notification = new PushNotificationOvertakenByFriend(exercise, username);

        for (const overtakenUserId of overtakenUsersIds) {
            this.pushNotificationService.sendNotification(overtakenUserId, notification);
        }
    }

    private async sendFirstFriendMovedNotifications(event: ExerciseAbsolvedInternalEvent, exercise: Exercise, username: string) {
        const ranking = await this.rankingService.getRankedFriendList(
            event.data.userId,
            event.data.exerciseId,
            RankingTimespans.RANKING_1_DAY
        );
        const friendsThatDidNotMoveYet = ranking.filter(friend => friend.score == 0);

        const notification = new PushNotificationFirstFriendMoved(exercise, username, event.data.repetitions);
        friendsThatDidNotMoveYet.forEach(friend =>
            this.pushNotificationService.sendNotificationWithoutSpam(1, friend.userId, notification)
        );
    }
}
