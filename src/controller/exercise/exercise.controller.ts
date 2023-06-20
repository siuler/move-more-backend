import { FastifyReply, RouteOptions } from 'fastify';
import { RouteTarget } from '../route-target';
import { TRAINING_ABSOLVED_SCHEMA } from './exercise-schema';
import { ExerciseService } from '../../service/exercise/exercise-service';
import { ExercisePerformedParams, ExercisePerformedPayload, ExerciseSet } from '../../domain/exercise/exercise';
import { AuthenticatedFastifyRequest } from '../../server/middleware/authenticated-request';
import { authenticate } from '../../server/middleware/authentication';

export class ExerciseController implements RouteTarget {
    constructor(private exerciseService: ExerciseService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/exercise/:exerciseId',
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

        await this.exerciseService.handleExerciseAbsolved(exerciseSet);
        reply.status(200).send();
    }
}
