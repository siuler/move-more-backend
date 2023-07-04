import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';
import { JavaScriptObject } from '../../repository/mysql/types';

export class AlreadyFriendsError extends Error {}
export class FriendRequestAlreadySentError extends Error {}
export class CantAddSelfAsFriendError extends Error {}

export interface DBFriend extends RowDataPacket {
    user_id: UserId;
    username: string;
}
export type Friend = JavaScriptObject<DBFriend>;

export interface DBAreFriendsResult extends RowDataPacket {
    are_friends: number;
}

export interface DBHasSentFriendRequestResult extends RowDataPacket {
    has_sent_request: number;
}

export type SendOrAcceptFriendRequestResult = { hasSent: boolean } | { hasAccepted: boolean };
