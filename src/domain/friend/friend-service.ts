import { PushNotification } from '../messaging/push-notification/push-notification';
import { PushNotificationService } from '../messaging/push-notification/service/push-notification-service';
import { UserId } from '../user/user';
import { UserService } from '../user/user-service';
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

export class FriendService {
    constructor(
        private friendRepository: FriendRepository,
        private friendRequestRepository: FriendRequestRepository,
        private friendAddTokenRepository: FriendAddTokenRepository,
        private userService: UserService,
        private pushNotificationService: PushNotificationService
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

    public async removeFriend(friend1: UserId, friend2: UserId) {
        if (!(await this.friendRepository.areFriends(friend1, friend2))) {
            throw new NotFriendsError();
        }
        return this.friendRepository.removeFriend(friend1, friend2);
    }

    public async createFriendAddToken(addableUser: UserId, validitySeconds: number) {
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
    }

    public async redeemFriendAddToken(redeemer: UserId, token: FriendAddToken) {
        const tokenInformation = await this.friendAddTokenRepository.getTokenInformation(token);
        if (tokenInformation.expiry.getTime() < Date.now()) {
            throw new FriendAddTokenExpiredError();
        }
        await this.befriend(tokenInformation.userId, redeemer);
    }

    private async befriend(requestSender: UserId, receiver: UserId) {
        await Promise.all([
            this.friendRequestRepository.removeFriendRequest(requestSender, receiver),
            this.friendRepository.insertFriends(requestSender, receiver),
        ]);
        const receiverUsername = await this.userService.getUsername(receiver);
        const notification = new PushNotification('MoveMore', `You are now friends with ${receiverUsername}`);
        this.pushNotificationService.sendNotification(requestSender, notification);
    }

    private async sendFriendRequest(requestSender: UserId, receiver: UserId) {
        await this.friendRequestRepository.sendFriendRequest(requestSender, receiver);
        const notification = new PushNotification('MoveMore', 'You received a new friend request');
        this.pushNotificationService.sendNotification(receiver, notification);
    }

    private generateFriendAddToken(): FriendAddToken {
        const randomValues = crypto.getRandomValues(new Uint8Array(8));
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';

        for (let i = 0; i < 8; i++) {
            randomString += characters.charAt(randomValues[i]);
        }

        return randomString as FriendAddToken;
    }
}
