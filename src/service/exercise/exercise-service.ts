import { ExerciseSet } from '../../domain/exercise/exercise';
import { ExerciseRepository } from '../../repository/exercise/exercise-repository';

export class ExerciseService {
    constructor(private performedExerciseRepository: ExerciseRepository) {}

    public async handleExerciseAbsolved(exerciseSet: ExerciseSet) {
        return this.performedExerciseRepository.persistAbsolvedExercise(exerciseSet);
    }
}
