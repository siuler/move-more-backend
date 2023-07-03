import { RouteOptions, FastifyReply } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { authenticate } from '../../../general/server/middleware/authentication';
import { FriendService } from '../friend-service';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';
import { SEARCH_FRIEND_SCHEMA, SearchFriendParams } from './friend-schema';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';

export class FriendController implements RouteTarget {
    constructor(private friendService: FriendService) {}

    public getRoutes(): RouteOptions[] {
        return <RouteOptions[]>[
            {
                url: '/friends',
                method: 'GET',
                preValidation: authenticate,
                handler: this.getFriendList.bind(this),
            },
            {
                url: '/friend/search/:query',
                method: 'GET',
                preValidation: authenticate,
                handler: this.searchUser.bind(this),
                schema: SEARCH_FRIEND_SCHEMA,
            },
        ];
    }

    public async getFriendList(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const friendList = await this.friendService.getFriendList(request.userId);
        reply.send(friendList);
    }

    public async searchUser(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const params = request.params as SearchFriendParams;

        if (params.query.length < 3) {
            throw new BadRequestError('query must be at least 3 characters long');
        }

        const potentialFriends = await this.friendService.findFriends(request.userId, params.query);
        reply.status(200).send(potentialFriends);
    }
}
