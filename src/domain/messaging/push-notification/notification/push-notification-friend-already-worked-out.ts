import { Exercise } from '../../../exercise/exercise';
import { PushNotification } from '../push-notification';

export class PushNotificationFriendAlreadyWorkedOut extends PushNotification {
    constructor(exercise: Exercise, overtakerName: string, repCount: number) {
        const exerciseName = repCount == 1 ? exercise.name : exercise.pluralizedName;
        super(exercise.pluralizedName, `${overtakerName} just did ${repCount} ${exerciseName}`, 'FRIEND_ALREADY_WORKED_OUT', {
            exerciseId: exercise.id.toString(),
        });
    }
}
