import { RouteOptions, FastifyReply } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { authenticate } from '../../../general/server/middleware/authentication';
import { FriendService } from '../friend-service';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';

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
        ];
    }

    public async getFriendList(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const friendList = await this.friendService.getFriendList(request.userId);
        reply.send(friendList);
    }
}
