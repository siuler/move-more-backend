import { ExerciseSet } from '../../domain/exercise/exercise';
import { PerformedExerciseRepository } from '../../repository/training/performed-exercise-repository';

export class TrainingService {
    constructor(private performedExerciseRepository: PerformedExerciseRepository) {}

    public async handleExercisePerformed(exerciseSet: ExerciseSet) {
        return this.performedExerciseRepository.persist(exerciseSet);
    }
}
