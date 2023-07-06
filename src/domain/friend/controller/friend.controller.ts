import { RouteOptions, FastifyReply } from 'fastify';
import { RouteTarget } from '../../../general/server/controller/route-target';
import { authenticate } from '../../../general/server/middleware/authentication';
import { FriendService } from '../friend-service';
import { AuthenticatedFastifyRequest } from '../../../general/server/middleware/authenticated-request';
import {
    REMOVE_FRIEND_SCHEMA,
    RemoveFriendParams,
    SEARCH_FRIEND_SCHEMA,
    SEND_FRIEND_REQUEST_SCHEMA,
    SearchFriendParams,
    SendFriendRequestPayload,
} from './friend-schema';
import { BadRequestError } from '../../../general/server/controller/error/bad-request-error';
import { AlreadyFriendsError, CantAddSelfAsFriendError, FriendRequestAlreadySentError, NotFriendsError } from '../friend';
import { ConflictError } from '../../../general/server/controller/error/conflict-error';
import { UserNotFoundError } from '../../user/user-error';

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
            {
                url: '/friend',
                method: 'POST',
                preValidation: authenticate,
                handler: this.sendOrAcceptFriendRequest.bind(this),
                schema: SEND_FRIEND_REQUEST_SCHEMA,
            },
            {
                url: '/friend/requests',
                method: 'GET',
                preValidation: authenticate,
                handler: this.listFriendRequests.bind(this),
            },
            {
                url: '/friend/:friendId',
                method: 'DELETE',
                preValidation: authenticate,
                handler: this.removeFriend.bind(this),
                schema: REMOVE_FRIEND_SCHEMA,
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

    public async sendOrAcceptFriendRequest(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const payload = request.body as SendFriendRequestPayload;

        try {
            const result = await this.friendService.sendOrAcceptFriendRequest(request.userId, payload.friendId);
            reply.status(200).send(result);
        } catch (error: unknown) {
            if (error instanceof CantAddSelfAsFriendError) {
                throw new BadRequestError('you can not send a friend request to yourself');
            } else if (error instanceof UserNotFoundError) {
                throw new BadRequestError('friend request receiver not found');
            } else if (error instanceof AlreadyFriendsError) {
                throw new ConflictError('you are already friends');
            } else if (error instanceof FriendRequestAlreadySentError) {
                throw new BadRequestError('you have already sent a friend request to this user');
            }
            throw error;
        }
    }

    public async listFriendRequests(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const friendRequests = await this.friendService.listFriendRequests(request.userId);
        reply.status(200).send(friendRequests);
    }

    public async removeFriend(request: AuthenticatedFastifyRequest, reply: FastifyReply) {
        const params = request.params as RemoveFriendParams;
        try {
            await this.friendService.removeFriend(request.userId, params.friendId);
            reply.status(200).send();
        } catch (error: unknown) {
            if (error instanceof NotFriendsError) {
                throw new BadRequestError('you were not friends');
            }
        }
    }
}
