import { Exercise } from '../../../exercise/exercise';
import { PushNotification } from '../push-notification';

export class PushNotificationFriendAlreadyWorkedOut extends PushNotification {
    constructor(exercise: Exercise, overtakerName: string, repCount: number) {
        super(
            `${exercise.pluralizedName}`,
            `${overtakerName} already did ${repCount} ${exercise.pluralizedName}`,
            'FRIEND_ALREADY_WORKED_OUT',
            {
                exerciseId: exercise.id.toString(),
            }
        );
    }
}
