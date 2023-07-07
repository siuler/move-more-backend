import { UserId } from '../user/user';
import {
    AlreadyFriendsError,
    CantAddSelfAsFriendError,
    Friend,
    FriendRequest,
    FriendRequestAlreadySentError,
    NoFriendRequestReceivedError,
    NotFriendsError,
    PotentialFriend,
    SendOrAcceptFriendRequestResult,
} from './friend';
import { FriendRepository } from './friend-repository';
import { FriendRequestRepository } from './friend-request-repository';

export class FriendService {
    constructor(private friendRepository: FriendRepository, private friendRequestRepository: FriendRequestRepository) {}

    public getFriendList(userId: UserId): Promise<Friend[]> {
        return this.friendRepository.getFriends(userId);
    }

    public areFriends(user1: UserId, user2: UserId): Promise<boolean> {
        return this.friendRepository.areFriends(user1, user2);
    }

    public findFriends(forUser: UserId, query: string): Promise<PotentialFriend[]> {
        return this.friendRepository.findFriends(forUser, query);
    }

    public async listFriendRequests(userId: UserId): Promise<FriendRequest[]> {
        return this.friendRequestRepository.listFriendRequest(userId);
    }

    public async sendOrAcceptFriendRequest(sender: UserId, receiver: UserId): Promise<SendOrAcceptFriendRequestResult> {
        if (sender === receiver) {
            throw new CantAddSelfAsFriendError();
        }
        if (await this.friendRepository.areFriends(sender, receiver)) {
            throw new AlreadyFriendsError();
        }
        if (await this.friendRequestRepository.hasSentFriendRequest(sender, receiver)) {
            throw new FriendRequestAlreadySentError();
        }

        if (await this.friendRequestRepository.hasSentFriendRequest(receiver, sender)) {
            await this.acceptFriendRequest(receiver, sender);
            return {
                hasAccepted: true,
            };
        } else {
            await this.friendRequestRepository.sendFriendRequest(sender, receiver);
            return {
                hasSent: true,
            };
        }
    }

    public async rejectFriendRequest(userId: UserId, rejectedUserId: UserId) {
        if (!(await this.friendRequestRepository.hasSentFriendRequest(rejectedUserId, userId))) {
            throw new NoFriendRequestReceivedError();
        }
        return this.friendRequestRepository.removeFriendRequest(rejectedUserId, userId);
    }

    public async removeFriend(friend1: UserId, friend2: UserId) {
        if (!(await this.friendRepository.areFriends(friend1, friend2))) {
            throw new NotFriendsError();
        }
        return this.friendRepository.removeFriend(friend1, friend2);
    }

    private async acceptFriendRequest(requestSender: UserId, receiver: UserId) {
        await Promise.all([
            this.friendRequestRepository.removeFriendRequest(requestSender, receiver),
            this.friendRepository.insertFriends(requestSender, receiver),
        ]);
    }
}
