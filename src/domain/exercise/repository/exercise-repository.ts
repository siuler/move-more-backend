import { ExerciseSet } from '../exercise';
import { Pool } from 'mysql2/promise';
import { ExerciseDoesNotExistError } from '../exercise-error';
import { isMySqlError } from '../../../repository/mysql/common-types';

const STMT_INSERT_PERFORMED_EXERCISE = `INSERT INTO performed_exercise(user_id, exercise_id, repetitions) VALUES (?,?,?)`;

export class ExerciseRepository {
    constructor(private connectionPool: Pool) {}

    public async persistAbsolvedExercise(exerciseSet: ExerciseSet) {
        try {
            await this.connectionPool.execute(STMT_INSERT_PERFORMED_EXERCISE, [
                exerciseSet.userId,
                exerciseSet.exerciseId,
                exerciseSet.repetitions,
            ]);
        } catch (error: unknown) {
            if (isMySqlError(error) && error.code && error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new ExerciseDoesNotExistError();
            }
            throw error;
        }
    }
}
