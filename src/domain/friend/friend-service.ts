import { UserId } from '../user/user';
import {
    AlreadyFriendsError,
    CantAddSelfAsFriendError,
    Friend,
    FriendRequestAlreadySentError,
    SendOrAcceptFriendRequestResult,
} from './friend';
import { FriendRepository } from './friend-repository';

export class FriendService {
    constructor(private friendRepository: FriendRepository) {}

    public getFriendList(userId: UserId): Promise<Friend[]> {
        return this.friendRepository.getFriends(userId);
    }

    public findFriends(forUser: UserId, query: string): Promise<Friend[]> {
        return this.friendRepository.findFriends(forUser, query);
    }

    public async sendOrAcceptFriendRequest(sender: UserId, receiver: UserId): Promise<SendOrAcceptFriendRequestResult> {
        if (sender === receiver) {
            throw new CantAddSelfAsFriendError();
        }
        if (await this.friendRepository.areFriends(sender, receiver)) {
            throw new AlreadyFriendsError();
        }
        if (await this.friendRepository.hasSentFriendRequest(sender, receiver)) {
            throw new FriendRequestAlreadySentError();
        }

        if (await this.friendRepository.hasSentFriendRequest(receiver, sender)) {
            await this.acceptFriendRequest(receiver, sender);
            return {
                hasAccepted: true,
            };
        } else {
            await this.friendRepository.sendFriendRequest(sender, receiver);
            return {
                hasSent: true,
            };
        }
    }

    private async acceptFriendRequest(requestSender: UserId, receiver: UserId) {
        await Promise.all([
            this.friendRepository.removeFriendRequest(requestSender, receiver),
            this.friendRepository.insertFriends(requestSender, receiver),
        ]);
    }
}
