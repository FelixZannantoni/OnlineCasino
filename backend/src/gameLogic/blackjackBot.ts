import { Card } from "../model";
import { CardVisibility } from "./deck";

export class BlackjackBot {
    private cards: Card[];
    private handValue: number;

    constructor() {
        this.cards = [];
        this.handValue = 0;
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

    public checkHandValue() {
        for (let i: number = 0; i < this.cards.length; i++) {
            this.handValue += this.cards[i].value;
        }
    }

    public makeMove(){
        this.checkHandValue();
        if(this.handValue < 17)
        {
            
        }
    }
}