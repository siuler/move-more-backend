import { Exercise, ExerciseSet, DBExercise, NewExercise } from '../exercise';
import { Pool } from 'mysql2/promise';
import { ExerciseDoesNotExistError } from '../exercise-error';
import { asJavaScriptObject, isMySqlError } from '../../../repository/mysql/types';
import { UserId } from '../../user/user';

const QUERY_LIST_EXERCISES_SORTED = `
    SELECT 
        exercise.*
    FROM exercise
    LEFT JOIN (
        SELECT exercise_id, COUNT(*) as count
        FROM performed_exercise
        WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        GROUP BY exercise_id
    ) counts
    ON exercise.id = counts.exercise_id
    ORDER BY counts.count DESC;
`;

const STMT_INSERT_PERFORMED_EXERCISE = `INSERT INTO performed_exercise(user_id, exercise_id, repetitions) VALUES (?,?,?)`;
const STMT_INSERT_EXERCISE = `INSERT INTO exercise(name,pluralized_name,image_url) VALUES(?,?,?)`;

export class ExerciseRepository {
    constructor(private connectionPool: Pool) {}

    public async listExercises(userId: UserId): Promise<Exercise[]> {
        const [exercises] = await this.connectionPool.query<DBExercise[]>(QUERY_LIST_EXERCISES_SORTED, [userId]);
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

    public async createExercise(exercise: NewExercise) {
        await this.connectionPool.execute(STMT_INSERT_EXERCISE, [exercise.name, exercise.pluralizedName, exercise.imageUrl]);
    }
}
