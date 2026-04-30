import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";
import { CardColor, CardName } from "./deck";


export const MIN_CARDS_FOR_FLUSH = 5;
export const MIN_CARDS_FOR_STRAIGHT = 5;
export const NUMBER_OF_CARDS_FOR_Quadruple = 4;
export const HIGHCARD_VALUE = 1;
export const PAIR_VALUE = 2;
export const TWOPAIR_VALUE = 3;
export const TRIPPLE_VALUE = 4;
export const STRAIGHT_VALUE = 5;
export const FLUSH_VALUE = 6;
export const FULLHOUSE_VALUE = 7;
export const QUADRUPLE_VALUE = 8;
export const STRAIGHTFLUSH_VALUE = 9;
export const ROYALFLUSH_VALUE = 10;


export class PokerPlayer extends CardGamePlayer {
    private pressedFold: boolean;
    private pressedCheck: boolean;
    private pressedBet: boolean;
    private pressedCall: boolean;
    private pressedRaise: boolean;
    private valueOfHand: number[];

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedFold = false;
        this.pressedCheck = false;
        this.pressedBet = false;
        this.pressedCall = false;
        this.pressedRaise = false;
        this.valueOfHand = [0];
    }

    public getCardCombinationValue(): number {
        return this.valueOfHand[0];
    }

    public getValueOfCardCombination(): number {
        let valueOfCardCombination: number = 0;

        for (let i: number = 1; i < this.valueOfHand.length; i++) {
            valueOfCardCombination += this.valueOfHand[i];
            valueOfCardCombination *= 10;
        }

        return valueOfCardCombination;
    }

    public setFolded(folded: boolean): void {
        this.pressedFold = folded;
    }

    public isFolded(): boolean {
        return this.pressedFold;
    }

    public getPressedFold(): boolean {
        return this.pressedFold;
    }

    public getPressedCheck(): boolean {
        return this.pressedCheck;
    }

    public getPressedBet(): boolean {
        return this.pressedBet;
    }

    public getPressedCall(): boolean {
        return this.pressedCall;
    }

    public getPressedRaise(): boolean {
        return this.pressedRaise;
    }


    public setPressedFold(pressedFold: boolean): void {
        if (pressedFold) this.resetActions();
        this.pressedFold = pressedFold;
        this.madeMove = true;
    }

    public setPressedCheck(pressedCheck: boolean): void {
        if (pressedCheck) this.resetActions();
        this.pressedCheck = pressedCheck;
        this.madeMove = true;
    }

    public setPressedBet(pressedBet: boolean): void {
        if (pressedBet) this.resetActions();
        this.pressedBet = pressedBet;
        this.madeMove = true;
    }

    public setPressedCall(pressedCall: boolean): void {
        if (pressedCall) this.resetActions();
        this.pressedCall = pressedCall;
        this.madeMove = true;
    }

    public setPressedRaise(pressedRaise: boolean): void {
        if (pressedRaise) this.resetActions();
        this.pressedRaise = pressedRaise;
        this.madeMove = true;
    }

    private resetActions(): void {
        this.pressedFold = false;
        this.pressedCheck = false;
        this.pressedBet = false;
        this.pressedCall = false;
        this.pressedRaise = false;
    }

    public resetMadeMove(): void {
        this.madeMove = false;
    }

    public checkHand(cards: Card[]) {
        const c = [...cards];
        if (this.hasRoyalFlush(c)) {
        }
        else if (this.hasStraightFlush(c)) {
        }
        else if (this.hasQuadruple(c)) {
        }
        else if (this.hasFullHouse(c)) {
        }
        else if (this.hasFlush(c)) {
        }
        else if (this.hasStraight(c)) {
        }
        else if (this.hasTripple(c)) {
        }
        else if (this.hasTwoPair(c)) {
        }
        else if (this.hasPair(c)) {
        }
        else {
            this.getHighCard(c);
        }
    }

    private hasRoyalFlush(cards: Card[]): boolean {
        cards.sort((a, b) => b.value - a.value);
        if (this.hasStraightFlush(cards) && cards[0].name == CardName.ace) {
            this.valueOfHand = [ROYALFLUSH_VALUE];
            return true;
        }
        return false;
    }

    private hasStraightFlush(cards: Card[]): boolean {
        let count: number = 1;
        let valueOfFstCardOfSrtFl: number = cards[0].value;

        cards.sort((a, b) => b.value - a.value);

        for (let i: number = 1; i < cards.length; i++) {
            if (cards[i].value == (cards[i - 1].value) - 1 && cards[i].color == cards[i - 1].color) {
                count++;
            }
            else {
                count = 1;
                valueOfFstCardOfSrtFl = cards[i].value;
            }
        }

        if (count >= 5) {
            this.valueOfHand = [STRAIGHTFLUSH_VALUE, valueOfFstCardOfSrtFl];
            return true;
        }

        return false;
    }

    private hasQuadruple(cards: Card[]): boolean {
        let count: number = 0;
        let valueOfHighestOtherCard: number = cards[6].value;

        for (let i: number = 0; i < cards.length - NUMBER_OF_CARDS_FOR_Quadruple; i++) {
            count = 0;
            for (let j: number = i; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    count++;
                    if (count == 4) {
                        this.valueOfHand = [QUADRUPLE_VALUE, cards[j].value, Math.max(valueOfHighestOtherCard, this.getPlayerHighCard())];
                        return true;
                    }
                }
                else {
                    valueOfHighestOtherCard = cards[j].value;
                }
            }
        }
        return false;
    }

    private hasFullHouse(cards: Card[]): boolean {
        let hasTripple: boolean = false;
        let valueOfTripple: number = 0;

        for (let i: number = 0; i < cards.length - 2; i++) {
            for (let j: number = i + 1; j < cards.length - 1; j++) {
                for (let k: number = j + 1; k < cards.length; k++) {
                    if (cards[i].name == cards[j].name && cards[j].name == cards[k].name) {
                        hasTripple = true;
                        valueOfTripple = cards[i].value;
                        for (let l: number = 0; l < cards.length; l++) {
                            if (cards[l].name == cards[i].name)
                                cards.splice(l, 1);
                        }
                    }
                }
            }
        }
        if (!hasTripple) {
            return false;
        }
        for (let i: number = 0; i < cards.length - 1; i++) {
            for (let j: number = i + 1; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    this.valueOfHand = [FULLHOUSE_VALUE, valueOfTripple, cards[i].value];
                    return true;
                }

            }
        }
        return false;
    }

    private hasFlush(cards: Card[]): boolean {
        let count: number = 0;
        let colorOfFlush: CardColor = CardColor.CLUBS;
        let hasFlush: boolean = false;

        for (let i: number = 0; i < cards.length - MIN_CARDS_FOR_FLUSH; i++) {
            count = 0;
            for (let j: number = i; j < cards.length; j++) {
                if (cards[i].color == cards[j].color) {
                    count++;
                    if (count == 5) {
                        hasFlush = true;
                        colorOfFlush = cards[i].color;
                    }
                }
            }
        }

        if (hasFlush) {

            for (let i: number = 0; i < cards.length; i++) {
                if (cards[i].color != colorOfFlush) {
                    cards.splice(i, 1);
                }
            }
            cards.sort((a, b) => b.value - a.value);

            this.valueOfHand = [FLUSH_VALUE, cards[0].value, cards[1].value, cards[2].value, cards[3].value, cards[4].value];
        }

        return hasFlush;
    }

    private hasStraight(cards: Card[]): boolean {
        let count: number = 1;
        let valueOfFirstCardOfStrFl: number = cards[0].value;

        cards.sort((a, b) => b.value - a.value);

        for (let i: number = 1; i < cards.length; i++) {
            if (cards[i].value == (cards[i - 1].value) - 1) {
                count++;
            }
            else {
                count = 1;
                valueOfFirstCardOfStrFl = cards[i].value;
            }
            if (count == 5) {
                this.valueOfHand = [STRAIGHT_VALUE, valueOfFirstCardOfStrFl, 0];
                return true;
            }
        }
        return false;
    }

    private hasTripple(cards: Card[]): boolean {
        let hasTripple: boolean = false;
        let valueOfTripple: number = 0;

        for (let i: number = 0; i < cards.length - 2; i++) {
            for (let j: number = i + 1; j < cards.length - 1; j++) {
                for (let k: number = j + 1; k < cards.length; k++) {
                    if (cards[i].name == cards[j].name && cards[j].name == cards[k].name) {
                        valueOfTripple = cards[i].value;
                        hasTripple = true;
                        cards.splice(i, 1);
                        cards.splice(j - 1, 1);
                        cards.splice(k - 2, 1);
                    }
                }
            }
        }

        if (hasTripple) {
            cards.sort((a, b) => b.value - a.value);
            this.valueOfHand = [TRIPPLE_VALUE, valueOfTripple, cards[0].value, cards[1].value];
        }

        return hasTripple;
    }

    private hasTwoPair(cards: Card[]): boolean {
        let hasOnePair: boolean = false;
        let hasTwoPair: boolean = false;
        let valueOfFstPair: number = 0;
        let valueOfSndPair: number = 0;

        for (let i: number = 0; i < cards.length - 1; i++) {
            for (let j: number = i + 1; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    valueOfFstPair = cards[i].value;
                    hasOnePair = true;
                    cards.splice(i, 1);
                    cards.splice(j - 1, 1);
                }
            }
        }

        if (!hasOnePair) {
            return false;
        }

        for (let i: number = 0; i < cards.length - 1; i++) {
            for (let j: number = i + 1; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    valueOfSndPair = cards[i].value;
                    hasTwoPair = true;
                    cards.splice(i, 1);
                    cards.splice(j - 1, 1);
                }
            }
        }

        if (hasTwoPair) {
            cards.sort((a, b) => b.value - a.value);
            this.valueOfHand = [TWOPAIR_VALUE, Math.max(valueOfFstPair, valueOfSndPair), Math.min(valueOfFstPair, valueOfSndPair), cards[0].value];
        }

        return hasTwoPair;
    }

    private hasPair(cards: Card[]): boolean {
        let hasPair: boolean = false;
        let valueOfPair: number = 0;

        for (let i: number = 0; i < cards.length - 1; i++) {
            for (let j: number = i + 1; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    hasPair = true;
                    valueOfPair = cards[i].value;
                    cards.splice(i, 1);
                    cards.splice(j - 1, 1); // j - 1, weil durch das Splice vorher schon ein Element weniger im Array ist
                }
            }
        }

        if (hasPair) {
            cards.sort((a, b) => b.value - a.value);
            this.valueOfHand = [PAIR_VALUE, valueOfPair, this.getPlayerHighCard(), cards[0].value, cards[1].value, cards[2].value];
        }

        return hasPair;
    }

    getHighCard(cards: Card[]) {
        cards.sort((a, b) => b.value - a.value);
        this.valueOfHand = [HIGHCARD_VALUE, cards[0].value, cards[1].value, cards[2].value, cards[3].value, cards[4].value]
    }


    private getPlayerHighCard(): number {
        return Math.max(this.cards[0].value, this.cards[1].value);
    }

    private getPlayerLowCard(): number {
        return Math.min(this.cards[0].value, this.cards[1].value);
    }
}