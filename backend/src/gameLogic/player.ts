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

    public static xNextPlayer(players: Player[], i: number,x: number): number
    {
        for(let j: number = 0; j < x; j++)
        {
            i = this.nextPlayer(players, i);
        }
        return i;
    }

    public static nextPlayer(players: Player[], i: number)
    {
        if(i <  players.length)
        {
             return i + 1;
        }
        else if (i == players.length)
        {
            return 0;
        }
        else
        {
            throw new Error(`Player not found`);
        }
    }

    public static playerWithDealerChip(players: Player[]): number
    {
        for(let i: number = 0; i < players.length; i++)
        {
            if(players[i].hasDealerChip == true)
            {
                return i;
            }
        }
        return 0;
    }

    //den owner auch ändern
    public clearHand(): void {
        this.cards = [];
    }
}