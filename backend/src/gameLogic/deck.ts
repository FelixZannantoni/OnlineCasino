const decksize: number = 52;

export type Card = {
    name: cardName,
    value: Map<cardName, number>,
    color: cardColor,
    owner: string
}

export enum cardColor {
    HEARTS,
    DIAMONDS,
    CLUBS,
    SPADES
}

export enum cardName {
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

const pockerCardValue: Map<cardName, number> = new Map([
    [cardName.two, 2],
    [cardName.three, 3],
    [cardName.four, 4],
    [cardName.five, 5],
    [cardName.six, 6],
    [cardName.seven, 7],
    [cardName.eight, 8],
    [cardName.nine, 9],
    [cardName.ten, 10],
    [cardName.jack, 11],
    [cardName.queen, 12],
    [cardName.king, 13],
    [cardName.ace, 14]
])

const blackjackCardValue: Map<cardName, number> = new Map([
    [cardName.two, 2],
    [cardName.three, 3],
    [cardName.four, 4],
    [cardName.five, 5],
    [cardName.six, 6],
    [cardName.seven, 7],
    [cardName.eight, 8],
    [cardName.nine, 9],
    [cardName.ten, 10],
    [cardName.jack, 10],
    [cardName.queen, 10],
    [cardName.king, 10],
    [cardName.ace, 11,],
])

class deck{
    constructor()
    {
        this.deckinit();
    }

    private deckinit()
    {

    }
}