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

export enum CardVisibility {
    player = "player",
    none = "none",
    all = "all"
}

export const DEALER_ID: string = "Dealer";

export class Deck {
    protected deck: Card[] = [];
    constructor() {

    }

    protected shuffle(cardDeck: Card[]) {
        for (let i: number = cardDeck.length - 1; i > 0; i--) {
            const randNum: number = Math.floor(Math.random() * (i + 1));
            const temp: Card = cardDeck[i];
            cardDeck[i] = cardDeck[randNum];
            cardDeck[randNum] = temp;
        }
    }

    public dealCard(cardDeck: Card[], id: string): Card {
        const cardIdx = cardDeck.findIndex(c => c.owner === DEALER_ID);

        if(cardIdx === -1) {
            throw new Error('No cards left in deck to deal.');
        }

        const card = cardDeck[cardIdx];

        if(!card) {
            throw new Error('Card is undefined!');
        }

        card.owner = id;

        return card;
    }

    public getDeck(): Card[] {
        const clonedCardDeck: Card[] = Array.from(this.deck);
        return clonedCardDeck;
    }
}