import { CardColor, CardName, CardVisibility } from "./gameLogic/deck";

export type User = {
    uuid: string,
    userName: string,
    displayName: string,
    email: string,
    balance: number,
    streakCount: number,
    lastStreakIncrement: string,
    lastFreeChipsClaim?: string,
    passwordHash: string
}

export type Card = {
    name: CardName,
    value: number;
    color: CardColor,
    owner: string,
    visibility: CardVisibility
}

export type LeaderboardEntry = {
    rank: number,
    userName: string,
    balance: number,
    streak: number,
    avatar: string
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

export type Cosmetic = {
    id: number,
    type: 'avatar' | 'card-back' | 'chip' | 'table-felt',
    name: string,
    price: number,
    description: string,
    icon: string,
    category: 'avatars' | 'card-backs' | 'chip-designs' | 'table-felts',
    rarity: 'common' | 'rare' | 'epic' | 'legendary',
    previewColors: string[],
    isOwned: boolean,
    isEquipped: boolean
}

export type Club = {
    id: number,
    name: string,
    members: UserDisplay[]
}

export type ClubSummary = {
    id: number,
    name: string,
    memberCount: number,
    totalBalance: number
}