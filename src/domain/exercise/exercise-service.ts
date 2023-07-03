import { ExerciseRepository } from './repository/exercise-repository';
import { Exercise, ExerciseSet } from './exercise';

export class ExerciseService {
    constructor(private exerciseRepository: ExerciseRepository) {}

    public async listExercises(): Promise<Exercise[]> {
        return this.exerciseRepository.listExercises();
    }

    public async handleExerciseAbsolved(exerciseSet: ExerciseSet) {
        return this.exerciseRepository.persistAbsolvedExercise(exerciseSet);
    }
}
