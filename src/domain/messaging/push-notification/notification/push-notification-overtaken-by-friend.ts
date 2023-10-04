import { Exercise } from '../../../exercise/exercise';
import { PushNotification } from '../push-notification';

export class PushNotificationOvertakenByFriend extends PushNotification {
    constructor(exercise: Exercise, overtakerName: string) {
        super(exercise.pluralizedName, `You have been overtaken by ${overtakerName}`, 'OVERTAKEN_BY_FRIEND', {
            exerciseId: exercise.id.toString(),
        });
    }
}
