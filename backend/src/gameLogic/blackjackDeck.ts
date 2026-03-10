import { CardColor, CardName, DEALER_ID, Deck } from "./deck";
import { Card } from "../model";

const blackjackCardValue: Map<CardName, number> = new Map([
    [CardName.two, 2],
    [CardName.three, 3],
    [CardName.four, 4],
    [CardName.five, 5],
    [CardName.six, 6],
    [CardName.seven, 7],
    [CardName.eight, 8],
    [CardName.nine, 9],
    [CardName.ten, 10],
    [CardName.jack, 10],
    [CardName.queen, 10],
    [CardName.king, 10],
    [CardName.ace, 11]//oder 1
]);

export class BlackjackDeck extends Deck {
    constructor() {
        super();
        this.blackjackDeckInit();
    }

    private blackjackDeckInit(): void {
        this.deck = [];
        for (const color of Object.values(CardColor)) {
            for (const name of Object.values(CardName)) {
                const card: Card = {
                    name: CardName[name],
                    value: blackjackCardValue.get(CardName[name])!,
                    color: CardColor[color],
                    owner: DEALER_ID
                };
                this.deck.push(card);
            }
        }
        this.shuffle(this.deck)
    }
}