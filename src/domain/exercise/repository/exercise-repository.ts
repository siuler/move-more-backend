import { Exercise, ExerciseSet, DBExercise } from '../exercise';
import { Pool } from 'mysql2/promise';
import { ExerciseDoesNotExistError } from '../exercise-error';
import { asJavaScriptObject, isMySqlError } from '../../../repository/mysql/types';

const QUERY_LIST_EXERCISES = `SELECT * FROM exercise`;

const STMT_INSERT_PERFORMED_EXERCISE = `INSERT INTO performed_exercise(user_id, exercise_id, repetitions) VALUES (?,?,?)`;

export class ExerciseRepository {
    constructor(private connectionPool: Pool) {}

    public async listExercises(): Promise<Exercise[]> {
        const [exercises] = await this.connectionPool.query<DBExercise[]>(QUERY_LIST_EXERCISES);
        return exercises.map(asJavaScriptObject);
    }

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
