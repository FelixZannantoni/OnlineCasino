import { Card } from "../model";
import { CardVisibility } from "./deck";
import { Player } from "./player";

export class CardGamePlayer extends Player {
    protected cards: Card[];
    private hasDealerChip: boolean;
    protected madeMove: boolean;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.hasDealerChip = false;
        this.cards = [];
        this.madeMove = false;
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public getDealerChip(): boolean {
        return this.hasDealerChip;
    }

    public getMadeMove(): boolean {
        return this.madeMove;
    }

    public setDealerChip(hasDealerChip: boolean): void {
        this.hasDealerChip = hasDealerChip;
    }

    public resetMadeMove(): void {
        this.madeMove = false;
    }

    public addCard(card: Card): void {
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