import { FastifyReply, RouteOptions } from 'fastify';
import { RouteTarget } from '../route-target';
import { SELECT_EXERCISE_SCHEMA, TRAINING_ABSOLVED_SCHEMA } from './exercise-schema';
import { ExerciseService } from '../../service/exercise/exercise-service';
import { ExercisePerformedParams, ExercisePerformedPayload, ExerciseSet, SelectExercisePayload } from '../../domain/exercise/exercise';
import { AuthenticatedFastifyRequest } from '../../server/middleware/authenticated-request';
import { authenticate } from '../../server/middleware/authentication';
import { ExerciseAlreadySelectedError, ExerciseDoesNotExistError, ExerciseNotAddedError } from '../../domain/exercise/exercise-error';
import { BadRequestError } from '../error/bad-request-error';

export class ExerciseController implements RouteTarget {
    constructor(private exerciseService: ExerciseService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/exercise',
                method: 'POST',
                preValidation: authenticate,
                handler: this.selectExercise.bind(this),
                schema: SELECT_EXERCISE_SCHEMA,
            },
            {
                url: '/exercise',
                method: 'GET',
                preValidation: authenticate,
                handler: this.getSelectedExercise.bind(this),
            },
            {
                url: '/exercise/train/:exerciseId',
                method: 'POST',
                preValidation: authenticate,
                handler: this.exerciseAbsolved.bind(this),
                schema: TRAINING_ABSOLVED_SCHEMA,
            },
        ];
    }

    public async selectExercise(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const payload = request.body as SelectExercisePayload;
        try {
            await this.exerciseService.selectExercise(request.userId, payload.exerciseId);
        } catch (error: unknown) {
            if (error instanceof ExerciseAlreadySelectedError) {
                reply.status(304).send();
            } else if (error instanceof ExerciseDoesNotExistError) {
                reply.status(400).send({ error: 'exercise does not exist' });
            }
            throw error;
        }
        reply.status(200).send();
    }

    public async getSelectedExercise(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const exercises = await this.exerciseService.getSelectedExercises(request.userId);
        reply.status(200).send(exercises);
    }

    public async exerciseAbsolved(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const routeParams = request.params as ExercisePerformedParams;
        const payload = request.body as ExercisePerformedPayload;

        const exerciseSet: ExerciseSet = {
            userId: request.userId,
            exerciseId: routeParams.exerciseId,
            repetitions: payload.repetitions,
        };
        try {
            await this.exerciseService.handleExerciseAbsolved(exerciseSet);
        } catch (error: unknown) {
            if (error instanceof ExerciseNotAddedError) {
                throw new BadRequestError('add the exercise to your selected exercises before you can train it');
            }
        }
        reply.status(200).send();
    }
}
