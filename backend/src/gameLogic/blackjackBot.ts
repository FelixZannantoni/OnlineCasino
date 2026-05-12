import { Card } from "../model";
import { CardVisibility } from "./deck";

export class BlackjackBot {
    private cards: Card[];
    private handValue: number;

    constructor() {
        this.cards = [];
        this.handValue = 0;
    }

    public getCards() {
        return this.cards;
    }


    public getHandValue() {
        this.checkHandValue();
        return this.handValue;
    }

    public addCard(card: Card): void {
        this.cards.push(card);
        if (this.cards.length == 1) {
            card.visibility = CardVisibility.none;

        }
        else {
            card.visibility = CardVisibility.all;
        }
    }


    private checkHandValue() {
        this.handValue = 0;
        let aceCount = 0;
        for (let i: number = 0; i < this.cards.length; i++) {
            this.handValue += this.cards[i].value;
            if (this.cards[i].name === "ace") {
                aceCount++;
            }
        }

        while (this.handValue > 21 && aceCount > 0) {
            this.handValue -= 10;
            aceCount--;
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
            this.checkHandValue(;
            if (this.handValue == 21) {
                return true;
            }
        }
        return false;
    }

    public clearHand(): void {
        this.cards = [];
        this.handValue = 0;
    }
}