import { Card } from "../model";

export class Player {
    //auf private setzen
    private playerId: string;
    private username: string;
    private displayname: string;
    private balance: number = 0;
    private cards: Card[] = [];
    private hasDealerChip: boolean;
    private bet: number;

    constructor(playerId: string, username: string, displayname: string, balance: number, hasDealerChip: boolean, bet: number) {
        this.playerId = playerId;
        this.username = username;
        this.displayname = displayname;
        this.balance = balance;
        this.hasDealerChip = hasDealerChip;
        this.bet = bet;
    }

    public getPlayerId(): string
    {
        return this.playerId;
    }

    public getUsername(): string
    {
        return this.username;
    }

    public getDisplayname(): string
    {
        return this.displayname;
    }

    public getDealerChip(): boolean {
        return this.hasDealerChip;
    }

    public setDealerChip(hasDealerChip: boolean): void {
        this.hasDealerChip = hasDealerChip;
    }

    public getBet(): number
    {
        return this.bet;
    }

    public setBet(bet: number): void
    {
        this.bet = bet;
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

    public clearHand(): void {
        this.cards = [];
    }
}