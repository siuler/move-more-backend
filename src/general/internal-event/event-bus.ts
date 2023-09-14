import { InternalEvent, InternalEventListener } from './internal-event';
import { InternalEventTopic } from './topic';

export class InternalEventBus {
    private static registeredListeners: { [key in InternalEventTopic]?: InternalEventListener[] } = {};

    public static on<T extends InternalEvent>(topic: InternalEventTopic, listener: InternalEventListener<T>): void {
        this.registeredListeners[topic] = this.registeredListeners[topic] || [];
        (this.registeredListeners[topic] as InternalEventListener<T>[]).push(listener);
    }

    public static emit(event: InternalEvent) {
        const listeners = this.registeredListeners[event.topic];
        if (!listeners || listeners.length == 0) {
            return;
        }
        for (const listener of listeners) {
            listener(event);
        }
    }
}
