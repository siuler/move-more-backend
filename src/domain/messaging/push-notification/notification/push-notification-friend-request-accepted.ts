import { PushNotification } from '../push-notification';

export class PushNotificationFriendRequestAccepted extends PushNotification {
    constructor(friendName: string) {
        super('New Friend', `${friendName} accepted your friend request`, 'FRIEND_REQUEST_ACCEPTED', {
            friendName: friendName,
        });
    }
}
