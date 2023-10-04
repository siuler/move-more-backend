import { Exercise } from '../../../exercise/exercise';
import { PushNotification } from '../push-notification';

export class PushNotificationFirstFriendMoved extends PushNotification {
    constructor(exercise: Exercise, overtakerName: string, repCount: number) {
        const exerciseName = repCount == 1 ? exercise.name : exercise.pluralizedName;
        super(exercise.pluralizedName, `${overtakerName} just did ${repCount} ${exerciseName}`, 'FIRST_FRIEND_MOVED', {
            exerciseId: exercise.id.toString(),
        });
    }
}
