import { InternalEvent } from '../../general/internal-event/internal-event';
import { UserId } from '../user/user';

type FriendRequestAcceptedInternalEventData = {
    senderId: UserId;
    receiverId: UserId;
};

export class FriendRequestAcceptedInternalEvent extends InternalEvent {
    constructor(public data: FriendRequestAcceptedInternalEventData) {
        super('friend-request-accepted');
    }
}
