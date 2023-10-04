import { InternalEvent } from '../../general/internal-event/internal-event';
import { UserId } from '../user/user';

type FriendRequestSentInternalEventData = {
    senderId: UserId;
    receiverId: UserId;
};

export class FriendRequestSentInternalEvent extends InternalEvent {
    constructor(public data: FriendRequestSentInternalEventData) {
        super('friend-request-sent');
    }
}
