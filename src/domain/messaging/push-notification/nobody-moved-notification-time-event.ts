import { InternalEvent } from '../../../general/internal-event/internal-event';

export class NobodyMovedNotificationTimeEvent extends InternalEvent {
    constructor() {
        super('nobody-moved-notification-time');
    }
}
