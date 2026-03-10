import {CardColor, CardName, DEALER_ID, Deck} from "./deck";
import {Card} from "../model";

const pokerCardValue: Map<CardName, number> = new Map([
    [CardName.two, 2],
    [CardName.three, 3],
    [CardName.four, 4],
    [CardName.five, 5],
    [CardName.six, 6],
    [CardName.seven, 7],
    [CardName.eight, 8],
    [CardName.nine, 9],
    [CardName.ten, 10],
    [CardName.jack, 11],
    [CardName.queen, 12],
    [CardName.king, 13],
    [CardName.ace, 14]//oder 1 wegen straße
]);

export class PokerDeck extends Deck{
    constructor()
    {
        super();
        this.pokerDeckInit();
    }

    private pokerDeckInit(): void {
        this.deck = [];
        for (const color of Object.values(CardColor)) {
            for (const name of Object.values(CardName)) {
                const card: Card = {
                    name: CardName[name],
                    value: pokerCardValue.get(CardName[name])!,
                    color: CardColor[color],
                    owner: DEALER_ID
                };
                this.deck.push(card);
            }
        }
        this.shuffle(this.deck)
    }
}
