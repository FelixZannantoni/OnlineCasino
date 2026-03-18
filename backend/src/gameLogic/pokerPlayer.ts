import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";


export const MIN_CARDS_FOR_FLUSH = 5;
export const MIN_CARDS_FOR_Quadruple = 4;


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

    public checkHand(cards: Card[]) {
        if (this.hasRoyalFlush(cards)) {
            this.handValue = [9,0,0];
        }
        else if (this.hasStraightFlush(cards)) {
            this.handValue = [8,0,0];
        }
        else if (this.hasQuadruple(cards)) {
            this.handValue = [7,0,0];
        }
        else if (this.hasFullHouse(cards)) {
            this.handValue = [6,0,0];
        }
        else if (this.hasFlush(cards)) {
            this.handValue = [5,0,0];
        }
        else if (this.hasStraight(cards)) {
            this.handValue = [4,0,0];
        }
        else if (this.hasTripple(cards)) {
            this.handValue = [3,0,0];
        }
        else if (this.hasPair(cards)) {
            this.handValue = [2,0,0];
        }
        else {
            this.handValue = [1,0,0];
        }
    }

    private hasRoyalFlush(cards: Card[]): boolean {
        return true;
    }

    private hasStraightFlush(cards: Card[]): boolean {
        return true;
    }

    private hasQuadruple(cards: Card[]): boolean {
        for (let i: number = 0; i < cards.length - MIN_CARDS_FOR_Quadruple; i++) {
            let count: number = 0;
            for (let j: number = i; j < cards.length; j++) {
                if (cards[i].name == cards[j].name) {
                    count++;
                }
            }
            if (count >= 4) {
                return true;
            }
        }
        return false;
    }

    private hasFullHouse(cards: Card[]): boolean {
        return true;
    }

    private hasFlush(cards: Card[]): boolean {
        for (let i: number = 0; i < cards.length - MIN_CARDS_FOR_FLUSH; i++) {
            let count: number = 0;
            for (let j: number = i; j < cards.length; j++) {
                if (cards[i].color == cards[j].color) {
                    count++;
                }
            }
            if (count >= 5) {
                return true;
            }
        }
        return false;
    }

    private hasStraight(cards: Card[]): boolean {
        return true;
    }

    private hasTripple(cards: Card[]): boolean {
        for (let i: number = 0; i < cards.length - 2; i++) {
            for (let j: number = i + 1; j < cards.length - 1; j++) {
                for (let k: number = j + 1; k < cards.length; k++) {
                    if (cards[i].name == cards[j].name && cards[j].name == cards[k].name) {
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
                if (cards[i].name == cards[j].name)
                    return true;
            }
        }
        return false;
    }
}