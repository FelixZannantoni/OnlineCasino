import { Card } from "../model";

export enum CardColor {
    HEARTS = "HEARTS",
    DIAMONDS = "DIAMONDS",
    CLUBS = "CLUBS",
    SPADES = "SPADES"
}

export enum CardName {
    two = "two",
    three = "three",
    four = "four",
    five = "five",
    six = "six",
    seven = "seven",
    eight = "eight",
    nine = "nine",
    ten = "ten",
    jack = "jack",
    queen = "queen",
    king = "king",
    ace = "ace"
}

export const DEALER_ID: string = "Dealer";

export class Deck {
    protected deck: Card[] = [];
    constructor() {

    }

    protected shuffle(cardDeck: Card[]) {
        for (let i: number = 0; i < 4; i++) {
            for (let j: number = 0; j < cardDeck.length; j++) {
                const randNum: number = Math.floor(Math.random() * (cardDeck.length - 1)) + 1;
                const temp: Card = cardDeck[j];
                cardDeck[j] = cardDeck[randNum];
                cardDeck[randNum] = temp;
            }
        }
    }

    public dealCard(cardDeck: Card[], id: string): Card {
        let b: boolean = true;
        let i = 0;
        do {
            if (cardDeck[i].owner == DEALER_ID) {
                b = false;
            }
            else {
                i++;
                if (i < cardDeck.length) {
                    throw new Error(`Error: To few Cards. All Cards are already owned by Players`);
                    b = false;
                }
            }
        } while (b);
        cardDeck[i].owner = id;
        return cardDeck[i];
    }

    public getDeck(): Card[] {
        const clonedCardDeck: Card[] = Array.from(this.deck);
        return clonedCardDeck;
    }
}