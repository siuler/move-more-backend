import { UserId } from '../user/user';

export type ExerciseId = number;
export type ExerciseSet = {
    userId: UserId;
    exerciseId: ExerciseId;
    repetitions: number;
};

export type SelectExercisePayload = {
    exerciseId: ExerciseId;
};

export type ExercisePerformedParams = {
    exerciseId: ExerciseId;
};

export type ExercisePerformedPayload = {
    repetitions: number;
};
