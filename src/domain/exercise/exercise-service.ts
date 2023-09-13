import { ExerciseRepository } from './repository/exercise-repository';
import { Exercise, ExerciseSet, NewExercise } from './exercise';
import { UserId } from '../user/user';

export class ExerciseService {
    constructor(private exerciseRepository: ExerciseRepository) {}

    public async listExercises(userId: UserId): Promise<Exercise[]> {
        return this.exerciseRepository.listExercises(userId);
    }

    public async handleExerciseAbsolved(exerciseSet: ExerciseSet) {
        return this.exerciseRepository.persistAbsolvedExercise(exerciseSet);
    }

    public async createExercise(exercise: NewExercise) {
        return this.exerciseRepository.createExercise(exercise);
    }
}
