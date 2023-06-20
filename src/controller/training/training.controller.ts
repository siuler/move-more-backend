import { FastifyReply, FastifyRequest, RouteOptions } from 'fastify';
import { RouteTarget } from '../route-target';
import { TRAINING_ABSOLVED_SCHEMA } from './training-schema';
import { TrainingService } from '../../service/training/training-service';
import { ExercisePerformedParams, ExercisePerformedPayload, ExerciseSet } from '../../domain/exercise/exercise';
import { AuthenticatedFastifyRequest } from '../../server/middleware/authenticated-request';
import { authenticate } from '../../server/middleware/authentication';

export class TraingingController implements RouteTarget {
    constructor(private trainingService: TrainingService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/training/:exerciseId',
                method: 'POST',
                preValidation: authenticate,
                handler: this.trainingAbsolved.bind(this),
                schema: TRAINING_ABSOLVED_SCHEMA,
            },
        ];
    }

    public async trainingAbsolved(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const routeParams = request.params as ExercisePerformedParams;
        const payload = request.body as ExercisePerformedPayload;

        const exerciseSet: ExerciseSet = {
            userId: request.userId,
            exerciseId: routeParams.exerciseId,
            repetitions: payload.repetitions,
        };

        await this.trainingService.handleExercisePerformed(exerciseSet);
        reply.status(200).send();
    }
}
