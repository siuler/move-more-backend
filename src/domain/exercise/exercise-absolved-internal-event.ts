import { InternalEvent } from '../../general/internal-event/internal-event';
import { UserId } from '../user/user';
import { ExerciseId } from './exercise';

type ExerciseAbsolvedInternalEventData = {
    exerciseId: ExerciseId;
    userId: UserId;
    repetitions: number;
};

export class ExerciseAbsolvedInternalEvent extends InternalEvent {
    constructor(public data: ExerciseAbsolvedInternalEventData) {
        super('exercise-absolved');
    }
}
