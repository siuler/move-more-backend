import { FastifyReply, RouteOptions } from 'fastify';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';
import { authenticate } from '../../../general/server/middleware/authentication';
import { ExercisePerformedParams, ExercisePerformedPayload, ExerciseSet } from '../exercise';
import { ExerciseService } from '../exercise-service';
import { TRAINING_ABSOLVED_SCHEMA } from './exercise-schema';
import { ExerciseDoesNotExistError } from '../exercise-error';
import { NotFoundError } from '../../../general/server/controller/error/not-found-error';

export class ExerciseController implements RouteTarget {
    constructor(private exerciseService: ExerciseService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/exercise/train/:exerciseId',
                method: 'POST',
                preValidation: authenticate,
                handler: this.exerciseAbsolved.bind(this),
                schema: TRAINING_ABSOLVED_SCHEMA,
            },
        ];
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
            if (error instanceof ExerciseDoesNotExistError) {
                throw new NotFoundError('the specified exercise id does not exist');
            }
            throw error;
        }
        reply.status(200).send();
    }
}
