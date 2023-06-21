import { ExerciseId, ExerciseSet } from '../../domain/exercise/exercise';
import { Pool } from 'mysql2/promise';
import { UserId } from '../../domain/user/user';
import { IRowCount } from '../mysql/common-types';
import { ExerciseAlreadySelectedError, ExerciseDoesNotExistError } from '../../domain/exercise/exercise-error';

const QUERY_HAS_USER_SELECTED_EXERCISE = `SELECT COUNT(*) as rowCount FROM selected_exercise WHERE user_id=? and exercise_id=?`;

const STMT_SELECT_EXERCISE = `INSERT INTO selected_exercise(user_id, exercise_id) VALUES(?,?)`;
const STMT_INSERT_PERFORMED_EXERCISE = `INSERT INTO performed_exercise(user_id, exercise_id, repetitions) VALUES (?,?,?)`;

export class ExerciseRepository {
    constructor(private connectionPool: Pool) {}

    public async hasUserSelectedExercise(userId: UserId, exerciseId: ExerciseId): Promise<boolean> {
        const [[rowCount]] = await this.connectionPool.query<IRowCount[]>(QUERY_HAS_USER_SELECTED_EXERCISE, [userId, exerciseId]);
        return rowCount.rowCount > 0;
    }

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

    public async persistAbsolvedExercise(exerciseSet: ExerciseSet) {
        await this.connectionPool.execute(STMT_INSERT_PERFORMED_EXERCISE, [
            exerciseSet.userId,
            exerciseSet.exerciseId,
            exerciseSet.repetitions,
        ]);
    }
}
