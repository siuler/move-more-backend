import { PushNotification } from '../push-notification';

export class PushNotificationFriendRequestReceived extends PushNotification {
    constructor(friendName: string) {
        super('New friend request', `${friendName} sent you a friend request`, 'FRIEND_REQUEST_RECEIVED', {
            friendName: friendName,
        });
    }
}
