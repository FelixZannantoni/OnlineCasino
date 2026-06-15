import { CardColor, CardName, CardVisibility } from "./gameLogic/deck";

export type User = {
    uuid: string,
    userName: string,
    displayName: string,
    email: string,
    balance: number,
    streakCount: number,
    passwordHash: string
}

export type Card = {
    name: CardName,
    value: number;
    color: CardColor,
    owner: string,
    visibility: CardVisibility
}

export type UserDisplay = {
    uuid: string,
    username: string,
    displayname: string,
    status: string
}

export type FriendshipRequest = {
    senderId: string,
    senderName: string,
    receiverId: string,
    receiverName: string,
    accepted: boolean
}

export type ChatMessage = {
    senderId: string,
    receiverId: string,
    content: string,
    timestamp: Date
}