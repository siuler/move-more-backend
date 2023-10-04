import { PushNotification } from '../push-notification';

export class PushNotificationFriendRequestReceived extends PushNotification {
    constructor(senderName: string) {
        super('New friend request', `${senderName} sent you a friend request`, 'FRIEND_REQUEST_RECEIVED', {
            senderName,
        });
    }
}
