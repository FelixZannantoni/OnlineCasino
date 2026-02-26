export type Card = {
    name: string,
    value: Map<CardName, number>,
    color: string,
    owner: string
}

export enum CardColor {
    HEARTS,
    DIAMONDS,
    CLUBS,
    SPADES
}

export enum CardName {
    two,
    three,
    four,
    five,
    six,
    seven,
    eight,
    nine,
    ten,
    jack,
    queen,
    king,
    ace
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
    [CardName.ace, 14]
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
    [CardName.ace, 11,],
])

export class Deck{
    constructor(gametype: GameType)
    {
        this.deckinit(gametype);
    }

    private deckinit(gametype: GameType)
    {
        let cardDeck: Card[] = [];
        
        for(let color in CardColor)
        {
            for(let name in CardName)
            {
                let card: Card = {
                    name: CardName[name],
                    value: gametype === GameType.Pocker ? pockerCardValue : blackjackCardValue,
                    color: CardColor[color],
                    owner: "Dealer"
                }
                cardDeck.push(card);
            }
        }
        this.shuffle(cardDeck);
    }

    private shuffle(cardDeck: Card[])
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
}