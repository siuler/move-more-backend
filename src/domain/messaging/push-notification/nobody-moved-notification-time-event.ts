import { InternalEvent } from '../../../general/internal-event/internal-event';

export class NobodyMovedNotificationTimeEvent extends InternalEvent {
    constructor() {
        super('friend-request-accepted');
    }
}
