import { Exercise, ExerciseId, ExerciseSet } from '../exercise';
import { Pool } from 'mysql2/promise';
import { UserId } from '../../user/user';
import { IUpdateResponse } from '../../../repository/mysql/common-types';
import { ExerciseAlreadySelectedError, ExerciseDoesNotExistError, ExerciseNotAddedError } from '../exercise-error';

const STMT_SELECT_EXERCISE = `INSERT INTO selected_exercise(user_id, exercise_id) VALUES(?,?)`;
const STMT_INSERT_PERFORMED_EXERCISE = `INSERT INTO performed_exercise(user_id, exercise_id, repetitions) VALUES (?,?,?)`;
const STMT_UPDATE_LAST_TRAINED = `UPDATE selected_exercise SET last_trained=NOW() WHERE user_id=? AND exercise_id=?`;

const QUERY_GET_SELECTED_EXERCISES = `
    SELECT
        exercise.id as id,
        exercise.name as name, 
        exercise.description as description 
    FROM selected_exercise 
        RIGHT JOIN exercise
        ON selected_exercise.exercise_id = exercise.id
    WHERE selected_exercise.user_id = ?
    ORDER BY selected_exercise.last_trained DESC`;

export class ExerciseRepository {
    constructor(private connectionPool: Pool) {}

    public async selectExercise(userId: UserId, exerciseId: ExerciseId) {
        try {
            await this.connectionPool.execute(STMT_SELECT_EXERCISE, [userId, exerciseId]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.code && error.code === 'ER_DUP_ENTRY') {
                throw new ExerciseAlreadySelectedError();
            } else if (error.code && error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new ExerciseDoesNotExistError();
            }
            throw error;
        }
    }

    public async getSelectedExercises(userId: UserId): Promise<Exercise[]> {
        const [exercises] = await this.connectionPool.query<Exercise[]>(QUERY_GET_SELECTED_EXERCISES, [userId]);
        return exercises;
    }

    public async updateLastTrained(userId: UserId, exerciseId: ExerciseId) {
        const updatedRows = await this.connectionPool.execute<IUpdateResponse>(STMT_UPDATE_LAST_TRAINED, [userId, exerciseId]);
        if (updatedRows[0].changedRows <= 0) {
            throw new ExerciseNotAddedError();
        }
    }

    public async persistAbsolvedExercise(exerciseSet: ExerciseSet) {
        await this.connectionPool.execute(STMT_INSERT_PERFORMED_EXERCISE, [
            exerciseSet.userId,
            exerciseSet.exerciseId,
            exerciseSet.repetitions,
        ]);
    }
}
