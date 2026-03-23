import { Card } from "../model";
import { CardVisibility } from "./deck";

export class BlackjackBot {
    private cards: Card[];

    constructor() {
        this.cards = [];
    }

    public addCard(card: Card, playerId: string): void {
        this.cards.push(card);
        if (this.cards.length == 1) {
            card.visibility = CardVisibility.none;

        }
        else {
            card.visibility = CardVisibility.all;
        }
    }
}