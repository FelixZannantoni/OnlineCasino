import { Card } from "../model";
import { CardVisibility } from "./deck";

export class BlackjackBot {
    private cards: Card[];
    private handValue: number;

    constructor() {
        this.cards = [];
        this.handValue = 0;
    }

    public getHandValue(){
        this.checkHandValue();
        return this.handValue;
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

    private checkHandValue() {
        for (let i: number = 0; i < this.cards.length; i++) {
            this.handValue += this.cards[i].value;
        }
    }

    public makesHit(): boolean {
        this.checkHandValue();
        if (this.handValue < 17) {
            return true;
        }
        return false;
    }

    public hasBlackJack(): boolean {
        if (this.cards.length == 2) {
            if (this.handValue == 21) {
                return true;
            }
        }
        return false;
    }
}