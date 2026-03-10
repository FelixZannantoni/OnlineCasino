import { Card } from "../model";
import { Player } from "./player";

export class CardGamePlayer extends Player
{
    private cards: Card[];
    private hasDealerChip: boolean;
    private bet: number;

    constructor(playerId: string, username: string, displayname: string, balance: number, hasDealerChip: boolean, bet: number) 
    {
        super(playerId, username, displayname, balance);
        this.hasDealerChip = hasDealerChip;
        this.bet = bet;
        this.cards = [];
    }

    public getCards(): Card[]
    {
        return this.cards;
    }

    public getDealerChip(): boolean
    {
        return this.hasDealerChip;
    }

    public setDealerChip(hasDealerChip: boolean): void
    {
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
        //TODO PlayerID
        this.cards.push(card);
    }

        public static playerWithDealerChip(players: CardGamePlayer[]): number
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
