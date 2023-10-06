import { InternalEventBus } from '../../general/internal-event/event-bus';
import { FriendRequestAcceptedInternalEvent } from './event/friend-request-accepted-internal-event';
import { UserId } from '../user/user';
import {
    AlreadyFriendsError,
    CantAddSelfAsFriendError,
    Friend,
    FriendAddToken,
    FriendRequest,
    FriendRequestAlreadySentError,
    NoFriendRequestReceivedError,
    NotFriendsError,
    PotentialFriend,
    SendOrAcceptFriendRequestResult,
} from './friend';
import { FriendAddTokenRepository } from './friend-add-token-repository';
import { AddFriendTokenAlreadyExistsError, FriendAddTokenExpiredError } from './friend-error';
import { FriendRepository } from './friend-repository';
import { FriendRequestRepository } from './friend-request-repository';
import { FriendRequestSentInternalEvent } from './event/friend-request-sent-internal-event';

export class FriendService {
    constructor(
        private friendRepository: FriendRepository,
        private friendRequestRepository: FriendRequestRepository,
        private friendAddTokenRepository: FriendAddTokenRepository
    ) {}

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
            await this.befriend(receiver, sender);
            return {
                hasAccepted: true,
            };
        } else {
            await this.sendFriendRequest(sender, receiver);
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

    public async removeFriend(removingUser: UserId, removedUser: UserId): Promise<FriendAddToken> {
        if (!(await this.friendRepository.areFriends(removingUser, removedUser))) {
            throw new NotFriendsError();
        }
        await this.friendRepository.removeFriend(removingUser, removedUser);
        return this.createFriendAddToken(removedUser, 10);
    }

    public async createFriendAddToken(addableUser: UserId, validitySeconds: number): Promise<FriendAddToken> {
        let retries = 0;
        while (retries < 5) {
            try {
                const expiryDate = new Date(Date.now() + validitySeconds * 1000);
                const token = this.generateFriendAddToken();
                await this.friendAddTokenRepository.saveToken(addableUser, token, expiryDate);
                return token;
            } catch (e) {
                if (e instanceof AddFriendTokenAlreadyExistsError && retries < 5) {
                    retries++;
                    continue;
                }
                throw e;
            }
        }
        throw new Error('unexpected error: unable to create friend add token');
    }

    public async redeemFriendAddToken(redeemer: UserId, token: FriendAddToken) {
        const tokenInformation = await this.friendAddTokenRepository.getTokenInformation(token);
        if (tokenInformation.userId == redeemer) {
            throw new CantAddSelfAsFriendError();
        }
        if (tokenInformation.expiry.getTime() < Date.now()) {
            throw new FriendAddTokenExpiredError();
        }
        if (await this.areFriends(redeemer, tokenInformation.userId)) {
            throw new AlreadyFriendsError();
        }
        await this.befriend(tokenInformation.userId, redeemer);
    }

    private async befriend(requestSender: UserId, receiver: UserId) {
        await Promise.all([
            this.friendRequestRepository.removeFriendRequest(requestSender, receiver),
            this.friendRepository.insertFriends(requestSender, receiver),
        ]);
        const friendRequestAcceptedEvent = new FriendRequestAcceptedInternalEvent({
            senderId: requestSender,
            receiverId: receiver,
        });
        InternalEventBus.emit(friendRequestAcceptedEvent);
    }

    private async sendFriendRequest(requestSender: UserId, receiver: UserId) {
        await this.friendRequestRepository.sendFriendRequest(requestSender, receiver);
        const friendRequestSentEvent = new FriendRequestSentInternalEvent({
            senderId: requestSender,
            receiverId: receiver,
        });
        InternalEventBus.emit(friendRequestSentEvent);
    }

    private generateFriendAddToken(): FriendAddToken {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';

        for (let i = 0; i < 8; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
        }

        return randomString as FriendAddToken;
    }
}
