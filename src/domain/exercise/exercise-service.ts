import { ExerciseRepository } from './repository/exercise-repository';
import { Exercise, ExerciseId, ExerciseSet } from './exercise';
import { ExerciseNotAddedError } from './exercise-error';
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
        const userHasAddedExercise = await this.exerciseRepository.hasUserSelectedExercise(exerciseSet.userId, exerciseSet.exerciseId);

        if (!userHasAddedExercise) {
            throw new ExerciseNotAddedError();
        }

        return this.exerciseRepository.persistAbsolvedExercise(exerciseSet);
    }
}
