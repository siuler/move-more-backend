import { InternalEventTopic } from './topic';

export abstract class InternalEvent {
    constructor(public readonly topic: InternalEventTopic) {}
}

export type InternalEventListener<T extends InternalEvent = InternalEvent> = (event: T) => void;
