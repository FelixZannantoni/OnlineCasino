import { CardColor, CardName, CardVisibility } from "./gameLogic/deck";

export type User = {
    uuid: string,
    username: string,
    displayname: string,
    email: string,
    balance: number,
    streakCount: number,
    lastStreakIncrement: string,
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