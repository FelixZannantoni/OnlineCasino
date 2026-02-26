import { Card } from "../model";

export class Player {
    public playerId: string;
    public balance: number = 0;
    public username: string;
    public cards: Card[] = [];

    constructor(playerId: string, username: string, balance: number = 0) {
        this.playerId = playerId;
        this.username = username;
        this.balance = balance;
    }

    public addCard(card: Card, playerId: string): void {
        if (this.playerId !== playerId) {
            throw new Error(`Cannot add card: player ID mismatch (expected ${this.playerId}, got ${playerId})`);
        }
        this.cards.push(card);
    }

    //den owner auf ändern
    public clearHand(): void {
        this.cards = [];
    }
}