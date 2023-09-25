import { RowDataPacket } from 'mysql2';
import { UserId } from '../user/user';
import { JavaScriptObject } from '../../repository/mysql/types';

export class AlreadyFriendsError extends Error {}
export class FriendRequestAlreadySentError extends Error {}
export class CantAddSelfAsFriendError extends Error {}
export class NotFriendsError extends Error {}
export class NoFriendRequestReceivedError extends Error {}

export interface DBFriend extends RowDataPacket {
    user_id: UserId;
    username: string;
}
export type Friend = JavaScriptObject<DBFriend>;

export type DBPotentialFriend = DBFriend & DBAreFriendsResult;
export type PotentialFriend = Friend & { areFriends: boolean };

export interface DBAreFriendsResult extends RowDataPacket {
    are_friends: number;
}

export interface DBHasSentFriendRequestResult extends RowDataPacket {
    has_sent_request: number;
}

export type SendOrAcceptFriendRequestResult = { hasSent: boolean } | { hasAccepted: boolean };

export interface DBFriendRequest extends RowDataPacket {
    user_id: number;
    username: string;
}
export type FriendRequest = JavaScriptObject<DBFriendRequest>;

export type FriendAddToken = `[a-zA-Z0-9]{8}`;

export interface DBFriendAddTokenInformation extends RowDataPacket {
    user_id: number;
    username: string;
    expiry: string;
}
export type FriendAddTokenInformation = Omit<JavaScriptObject<DBFriendAddTokenInformation>, 'expiry'> & { expiry: Date };
