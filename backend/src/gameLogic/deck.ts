import { error } from "console";
import {Card} from "../model";

export enum CardColor {
    HEARTS,
    DIAMONDS,
    CLUBS,
    SPADES
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

export enum GameType {
    Pocker,
    Blackjack
}

const pockerCardValue: Map<CardName, number> = new Map([
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
])

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
    [CardName.ace, 11],//oder 1
])

export const DEALER_ID: string = "Dealer";
export class Deck{
    protected deck: Card[] = [];
    constructor()
    {
        
    }

    protected shuffle(cardDeck: Card[])
    {
        for(let i: number = 0; i < 4; i++)
        {
            for(let i: number = 0; i < cardDeck.length; i++)
            {
                const randNum: number = Math.floor(Math.random() * (cardDeck.length - 1)) + 1;
                const temp: Card = cardDeck[i];
                cardDeck[i] = cardDeck[randNum];
                cardDeck[randNum] = temp;
            }
        }
    }

    public dealCard(cardDeck: Card[],playerId: string ): Card
    {
        let b: boolean = true;
        let i = 0;
        do
        {
            if(cardDeck[i].owner == DEALER_ID)
            {
                b = false;
            }
            else
            {
                i++;
                if(i<cardDeck.length)
                {
                    throw new Error(`Error: To few Cards. All Cards are already owned by Players`);
                    b = false;
                }
            }
        }while(b);
        cardDeck[i].owner = playerId;
        return cardDeck[i];
    }

    public getDeck(): Card[]
    {
        const clonedCardDeck: Card[] = Array.from(this.deck);
        return clonedCardDeck;
    }
}
 
export class PockerDeck extends Deck{
    constructor()
    {
        super();
        this.pokerDeckInit();
    }

    private pokerDeckInit()
    {
        for(let color in CardColor)
        {
            for(let name of Object.values(CardName))
            {
                let card: Card = {
                    name: CardName[name],
                    value: pockerCardValue.get(CardName[name])!,
                    color: CardColor[color],
                    owner: DEALER_ID
                }
                this.deck.push(card);
            }
        }
        this.shuffle(this.deck)
    }
}

export class BlackjackDeck extends Deck{
    constructor()
    {
        super();
        this.blackjackDeckInit();
    }

    private blackjackDeckInit()
    {
        for(let color in CardColor)
        {
            for(let name of Object.values(CardName))
            {
                let card: Card = {
                    name: CardName[name],
                    value: blackjackCardValue.get(CardName[name])!,
                    color: CardColor[color],
                    owner: DEALER_ID
                }
                this.deck.push(card);
            }
        }
        this.shuffle(this.deck)
    }
}