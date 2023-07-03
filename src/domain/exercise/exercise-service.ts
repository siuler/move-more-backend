import { ExerciseRepository } from './repository/exercise-repository';
import { ExerciseSet } from './exercise';

export class ExerciseService {
    constructor(private exerciseRepository: ExerciseRepository) {}

    public async handleExerciseAbsolved(exerciseSet: ExerciseSet) {
        return this.exerciseRepository.persistAbsolvedExercise(exerciseSet);
    }
}
