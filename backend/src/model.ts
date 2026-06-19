import { CardColor, CardName, CardVisibility } from "./gameLogic/deck";

export type User = {
    uuid: string,
    username: string,
    displayname: string,
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

export type Cosmetic = {
    id: number,
    type: 'avatar' | 'card-back' | 'chip',
    name: string,
    price: number
}