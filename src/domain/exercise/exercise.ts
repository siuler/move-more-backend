import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';
import { JavaScriptObject } from '../../repository/mysql/types';

export type ExerciseId = number;

export interface DBExercise extends RowDataPacket {
    id: ExerciseId;
    name: string;
    pluralized_name: string;
    image_url: string;
}
export type Exercise = JavaScriptObject<DBExercise>;

export type ExerciseSet = {
    userId: UserId;
    exerciseId: ExerciseId;
    repetitions: number;
};

export type ExercisePerformedParams = {
    exerciseId: ExerciseId;
};

export type ExercisePerformedPayload = {
    repetitions: number;
};
