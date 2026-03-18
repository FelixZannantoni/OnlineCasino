import { CardColor, CardName, CardVisibility } from "./gameLogic/deck";

export type User = {
    uuid: string,
    username: string,
    displayname: string,
    email: string,
    streakCount: number,
    passwordHash: string
}

export type Card = {//TODO number und value
    name: CardName,
    value: number;
    color: CardColor,
    owner: string,
    visibility: CardVisibility
}