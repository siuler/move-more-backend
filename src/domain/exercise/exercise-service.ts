import { ExerciseRepository } from './repository/exercise-repository';
import { Exercise, ExerciseId, ExerciseSet } from './exercise';
import { UserId } from '../user/user';

export class ExerciseService {
    constructor(private exerciseRepository: ExerciseRepository) {}

    public async selectExercise(userId: UserId, exerciseId: ExerciseId) {
        return this.exerciseRepository.selectExercise(userId, exerciseId);
    }

    public async getSelectedExercises(userId: UserId): Promise<Exercise[]> {
        return this.exerciseRepository.getSelectedExercises(userId);
    }

    public async handleExerciseAbsolved(exerciseSet: ExerciseSet) {
        await this.exerciseRepository.updateLastTrained(exerciseSet.userId, exerciseSet.exerciseId);
        return this.exerciseRepository.persistAbsolvedExercise(exerciseSet);
    }
}
