import { ExerciseRepository } from './repository/exercise-repository';
import { Exercise, ExerciseId, ExerciseSet, NewExercise } from './exercise';
import { UserId } from '../user/user';
import { ExerciseAbsolvedInternalEvent } from './exercise-absolved-internal-event';
import { InternalEventBus } from '../../general/internal-event/event-bus';

export class ExerciseService {
    constructor(private exerciseRepository: ExerciseRepository) {}

    public async listExercises(userId: UserId): Promise<Exercise[]> {
        return this.exerciseRepository.listExercises(userId);
    }

    public async findById(exerciseId: ExerciseId): Promise<Exercise> {
        return this.exerciseRepository.findById(exerciseId);
    }

    public async handleExerciseAbsolved(exerciseSet: ExerciseSet) {
        await this.exerciseRepository.persistAbsolvedExercise(exerciseSet);
        InternalEventBus.emit(new ExerciseAbsolvedInternalEvent(exerciseSet));
        return;
    }

    public async createExercise(exercise: NewExercise) {
        return this.exerciseRepository.createExercise(exercise);
    }
}
