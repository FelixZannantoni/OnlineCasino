import { Card } from "../model";
import { CardVisibility } from "./deck";
import { Player } from "./player";

export class CardGamePlayer extends Player {
    private cards: Card[];
    private hasDealerChip: boolean;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.hasDealerChip = false;
        this.cards = [];
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public getDealerChip(): boolean {
        return this.hasDealerChip;
    }

    public setDealerChip(hasDealerChip: boolean): void {
        this.hasDealerChip = hasDealerChip;
    }

    public addCard(card: Card, playerId: string): void {
        //nur mit dealCard aufrufen wegen id
        this.cards.push(card);
        card.visibility = CardVisibility.player;
    }

    public static playerWithDealerChip(players: CardGamePlayer[]): number {
        for (let i: number = 0; i < players.length; i++) {
            if (players[i].hasDealerChip == true) {
                return i;
            }
        }
        return 0;
    }

    public clearHand(): void {
        this.cards = [];
    }
}