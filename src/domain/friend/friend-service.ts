import { UserId } from '../user/user';
import { Friend } from './friend';
import { FriendRepository } from './friend-repository';

export class FriendService {
    constructor(private friendRepository: FriendRepository) {}

    public getFriendList(userId: UserId): Promise<Friend[]> {
        return this.friendRepository.getFriends(userId);
    }
}
