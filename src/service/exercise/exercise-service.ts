import { ExerciseRepository } from '../../repository/exercise/exercise-repository';
import { ExerciseId, ExerciseSet } from '../../domain/exercise/exercise';
import { ExerciseNotAddedError } from '../../domain/exercise/exercise-error';
import { UserId } from '../../domain/user/user';

export class ExerciseService {
    constructor(private exerciseRepository: ExerciseRepository) {}

    public async selectExercise(userId: UserId, exerciseId: ExerciseId) {
        return this.exerciseRepository.selectExercise(userId, exerciseId);
    }

    public async handleExerciseAbsolved(exerciseSet: ExerciseSet) {
        const userHasAddedExercise = await this.exerciseRepository.hasUserSelectedExercise(exerciseSet.userId, exerciseSet.userId);

        if (!userHasAddedExercise) {
            throw new ExerciseNotAddedError();
        }

        return this.exerciseRepository.persistAbsolvedExercise(exerciseSet);
    }
}
