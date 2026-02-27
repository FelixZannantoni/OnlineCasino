import { Card } from "../model";

export class Player {
    public playerId: string;
    public balance: number = 0;
    public username: string;
    public cards: Card[] = [];
    public hasDealerChip: boolean;

    constructor(playerId: string, username: string, balance: number, hasDealerChip: boolean) {
        this.playerId = playerId;
        this.username = username;
        this.balance = balance;
        this.hasDealerChip = hasDealerChip;
    }

    public addCard(card: Card, playerId: string): void {
        if (this.playerId !== playerId) {
            throw new Error(`Cannot add card: player ID mismatch (expected ${this.playerId}, got ${playerId})`);
        }
        this.cards.push(card);
    }

    public static nextPlayer(players: Player[], i: number)
    {
        if(i < players.length)
        {
            return 0;
        }
        else
        {
            return i + 1;
        }
    }

    //den owner auch ändern
    public clearHand(): void {
        this.cards = [];
    }
}