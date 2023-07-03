import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';

export type ExerciseId = number;

export interface Exercise extends RowDataPacket {
    id: ExerciseId;
    name: string;
    description: string;
}

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
