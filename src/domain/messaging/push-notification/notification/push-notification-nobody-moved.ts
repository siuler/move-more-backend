import { Exercise } from '../../../exercise/exercise';
import { PushNotification } from '../push-notification';

export class PushNotificationNobodyMoved extends PushNotification {
    constructor(exercise: Exercise) {
        super('Dominate the ranking', `Nobody made ${exercise.pluralizedName} yet. Move now to be #1`, 'NOBODY_MOVED_YET', {
            exerciseId: exercise.id.toString(),
        });
    }
}
