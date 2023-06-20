import { UserId } from '../user/user';

export type ExerciseId = number;
export type ExerciseSet = {
    userId: UserId;
    exerciseId: ExerciseId;
    repetitions: number;
};

export type ExercisePerformedParams = {
    exerciseId: number;
};

export type ExercisePerformedPayload = {
    repetitions: number;
};
