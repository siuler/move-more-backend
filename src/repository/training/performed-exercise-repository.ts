import { ExerciseId, ExerciseSet } from '../../domain/exercise/exercise';
import { UserId } from '../../domain/user/user';
import { Pool } from 'mysql2/promise';

const STMT_INSERT_PERFORMED_EXERCISE = `INSERT INTO performed_exercise(user_id, exercise_id, repetitions) VALUES (?,?,?)`;

export class PerformedExerciseRepository {
    constructor(private connectionPool: Pool) {}

    public async persist(exerciseSet: ExerciseSet) {
        await this.connectionPool.execute(STMT_INSERT_PERFORMED_EXERCISE, [
            exerciseSet.userId,
            exerciseSet.exerciseId,
            exerciseSet.repetitions,
        ]);
    }
}
