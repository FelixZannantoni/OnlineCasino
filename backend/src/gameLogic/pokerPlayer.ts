import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";
import { CardName } from "./deck";


export const MIN_CARDS_FOR_FLUSH = 5;
export const MIN_CARDS_FOR_STRAIGHT = 5;
export const NUMBER_OF_CARDS_FOR_Quadruple = 4;
export const PAIR_VALUE = 2;
export const TRIPPLE_VALUE = 3;
export const STRAIGHT_VALUE = 4;
export const FLUSH_VALUE = 5;
export const FULLHOUSE_VALUE = 6;
export const QUADRUPLE_VALUE = 7;
export const STRAIGHTFLUSH_VALUE = 8;
export const ROYALFLUSH_VALUE = 9;


export class PokerPlayer extends CardGamePlayer {
    private pressedFold: boolean;
    private pressedCheck: boolean;
    private pressedBet: boolean;
    private pressedCall: boolean;
    private pressedRaise: boolean;
    private handValue: number[];

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedFold = false;
        this.pressedCheck = false;
        this.pressedBet = false;
        this.pressedCall = false;
        this.pressedRaise = false;
        this.handValue = [0, 0, 0];
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
    }

    public setPressedCheck(pressedCheck: boolean): void {
        if (pressedCheck) this.resetActions();
        this.pressedCheck = pressedCheck;
    }

    public setPressedBet(pressedBet: boolean): void {
        if (pressedBet) this.resetActions();
        this.pressedBet = pressedBet;
    }

    public setPressedCall(pressedCall: boolean): void {
        if (pressedCall) this.resetActions();
        this.pressedCall = pressedCall;
    }

    public setPressedRaise(pressedRaise: boolean): void {
        if (pressedRaise) this.resetActions();
        this.pressedRaise = pressedRaise;
    }

    private resetActions(): void {
        this.pressedFold = false;
        this.pressedCheck = false;
        this.pressedBet = false;
        this.pressedCall = false;
        this.pressedRaise = false;
    }

    public getHandValue() {
        return this.handValue;
    }

    public checkHand(cards: Card[]) {
        if (this.hasRoyalFlush(cards)) {
        }
        else if (this.hasStraightFlush(cards)) {
        }
        else if (this.hasQuadruple(cards)) {
        }
        else if (this.hasFullHouse(cards)) {
        }
        else if (this.hasFlush(cards)) {
        }
        else if (this.hasStraight(cards)) {
        }
        else if (this.hasTripple(cards)) {
        }
        else if (this.hasPair(cards)) {
        }
        else {
            this.handValue = [this.getHighestCard(cards), this.getLowestCard(cards), 0];
        }
    }

    private hasRoyalFlush(cards: Card[]): boolean {
        cards.sort((a, b) => a.value - b.value);
        if (this.hasStraightFlush(cards) && cards[4].name == CardName.ace) {
            this.handValue = [ROYALFLUSH_VALUE, 0, 0];
            return true;
        }
        return false;
    }

    private hasStraightFlush(cards: Card[]): boolean {
        cards.sort((a, b) => a.value - b.value);
        let count: number = 1;
        let sum: number = cards[0].value;
        for (let i: number = 1; i < cards.length; i++) {
            if (cards[i].value == (cards[i - 1].value) - 1 && cards[i].color == cards[i - 1].color) {
                count++;
                sum += cards[i].value;
            }
            else {
                count = 1;
                sum = cards[i].value;
            }
        }
        if (count >= 5) {
            this.handValue = [STRAIGHTFLUSH_VALUE, sum, 0];//TODO geht nur wenn count 5 ist
            return true;
        }
        return false;
    }

    private hasQuadruple(cards: Card[]): boolean {
        for (let i: number = 0; i < cards.length - NUMBER_OF_CARDS_FOR_Quadruple; i++) {
            let count: number = 0;
            for (let j: number = i; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    count++;
                    if (count == 4) {
                        this.handValue = [QUADRUPLE_VALUE, cards[j].value, 0];
                        return true;
                    }
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
                    this.handValue = [TRIPPLE_VALUE, valueOfTripple, cards[i].value];
                    return true;
                }

            }
        }
        return false;
    }

    private hasFlush(cards: Card[]): boolean {
        for (let i: number = 0; i < cards.length - MIN_CARDS_FOR_FLUSH; i++) {
            let count: number = 0;
            let sum: number = 0;
            for (let j: number = i; j < cards.length; j++) {
                if (cards[i].color == cards[j].color) {
                    count++;
                    sum += cards[j].value;
                }
            }
            if (count >= 5) {
                this.handValue = [FLUSH_VALUE, sum, 0];//TODO geht nur wenn count 5 ist
                return true;
            }
        }
        return false;
    }

    private hasStraight(cards: Card[]): boolean {
        cards.sort((a, b) => a.value - b.value);
        let count: number = 1;
        let sum: number = cards[0].value;
        for (let i: number = 1; i < cards.length; i++) {
            if (cards[i].value == (cards[i - 1].value) - 1) {
                count++;
                sum += cards[i].value;
            }
            else {
                count = 1;
                sum = cards[i].value;
            }
        }
        if (count >= 5) {
            this.handValue = [STRAIGHT_VALUE, sum, 0];//TODO geht nur wenn count 5 ist
            return true;
        }
        return false;
    }

    private hasTripple(cards: Card[]): boolean {
        for (let i: number = 0; i < cards.length - 2; i++) {
            for (let j: number = i + 1; j < cards.length - 1; j++) {
                for (let k: number = j + 1; k < cards.length; k++) {
                    if (cards[i].name == cards[j].name && cards[j].name == cards[k].name) {
                        this.handValue = [TRIPPLE_VALUE, cards[i].value, this.getHighestCard(cards)];
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private hasPair(cards: Card[]): boolean {
        for (let i: number = 0; i < cards.length - 1; i++) {
            for (let j: number = i + 1; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    this.handValue = [PAIR_VALUE, cards[i].value, this.getHighestCard(cards)];
                    return true;
                }

            }
        }
        return false;
    }

    private getHighestCard(cards: Card[]): number {
        return Math.max(cards[0].value, cards[1].value);
    }

    private getLowestCard(cards: Card[]): number {
        return Math.min(cards[0].value, cards[1].value);
    }
}