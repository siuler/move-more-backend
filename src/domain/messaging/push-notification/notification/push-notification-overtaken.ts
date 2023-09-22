import { Exercise } from '../../../exercise/exercise';
import { PushNotification } from '../push-notification';

export class PushNotificationOvertaken extends PushNotification {
    constructor(exercise: Exercise, overtakerName: string) {
        super(`MoveMore ${exercise.pluralizedName}`, `You have been overtaken by ${overtakerName}`, {
            exerciseId: exercise.id.toString(),
        });
    }
}
