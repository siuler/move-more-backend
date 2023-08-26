import { RouteOptions, FastifyReply } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { authenticate } from '../../../general/server/middleware/authentication';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';
import {
    STATISTIC_PACKET_SCHEMA as GET_STATISTIC_PACKET_SCHEMA,
    StatisticPacketParams,
    StatisticPacketQueryParams,
} from './statistic-schema';
import { StatisticService } from '../statistic-service';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { FriendService } from '../../friend/friend-service';
import { ForbiddenError } from '../../../general/server/controller/error/forbidden-error';
import { validateDate } from '../../../general/util';

export class StatisticController implements RouteTarget {
    constructor(private statisticService: StatisticService, private friendService: FriendService) {}

    getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/statistic/:exerciseId',
                method: 'GET',
                preValidation: authenticate,
                handler: this.getStatisticPacket.bind(this),
                schema: GET_STATISTIC_PACKET_SCHEMA,
            },
        ];
    }

    public async getStatisticPacket(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const params = request.params as StatisticPacketParams;
        const queryParams = request.query as StatisticPacketQueryParams;

        await this.validateParams(request, queryParams);

        let firstDateNotToInclude = null;
        if (queryParams.firstKnown && validateDate(queryParams.firstKnown)) {
            firstDateNotToInclude = queryParams.firstKnown;
        }

        const requestedUserIds = [queryParams.comparedUser];
        if (queryParams.comparedUser !== request.userId) {
            requestedUserIds.push(request.userId);
        }

        const statistics = await this.statisticService.getStatisticsForUsers(requestedUserIds, {
            exerciseId: params.exerciseId,
            timespan: queryParams.timespan,
            firstDateNotToInclude,
        });

        reply.status(200).send(statistics);
    }

    private async validateParams(request: AuthenticatedFastifyRequest, queryParams: StatisticPacketQueryParams) {
        if (!['day', 'week', 'month'].includes(queryParams.timespan)) {
            throw new BadRequestError('timespan must be day, week or month');
        }

        const isSelf = request.userId === queryParams.comparedUser;
        if (!isSelf && !(await this.friendService.areFriends(request.userId, queryParams.comparedUser))) {
            throw new ForbiddenError('you can only view statistics of your friends');
        }
    }
}
