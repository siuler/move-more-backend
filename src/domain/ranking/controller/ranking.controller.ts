import { RouteOptions, FastifyReply } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { authenticate } from '../../../general/server/middleware/authentication';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';
import { RankingService } from '../ranking-service';
import { RANKED_FRIEND_LIST_SCHEMA, RankedFriendListParams } from './ranking-schema';
import { RankingTimespans } from '../ranking';
import { InvalidTimespanError } from '../../../general/error';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';

export class RankingController implements RouteTarget {
    constructor(private rankingService: RankingService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/ranking/friends/:exerciseId/:timespan',
                method: 'GET',
                preValidation: authenticate,
                handler: this.getRankedFriendList.bind(this),
                schema: RANKED_FRIEND_LIST_SCHEMA,
            },
        ];
    }

    public async getRankedFriendList(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const requestParams = request.params as RankedFriendListParams;

        try {
            const timespan = RankingTimespans.fromRequestTimespan(requestParams.timespan);
            const rankedFriendList = await this.rankingService.getRankedFriendList(request.userId, requestParams.exerciseId, timespan);
            reply.status(200).send(rankedFriendList);
        } catch (error: unknown) {
            if (error instanceof InvalidTimespanError) {
                throw new BadRequestError('requested timespan is invalid');
            }
            throw error;
        }
    }
}
