import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";

export class PokerPlayer extends CardGamePlayer {
    private pressedFold: boolean;
    private pressedCheck: boolean;
    private pressedBet: boolean;
    private pressedCall: boolean;
    private pressedRaise: boolean;
    private handValue: number;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedFold = false;
        this.pressedCheck = false;
        this.pressedBet = false;
        this.pressedCall = false;
        this.pressedRaise = false;
        this.handValue = 0;
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

    public resetActions(): void {
        this.pressedFold = false;
        this.pressedCheck = false;
        this.pressedBet = false;
        this.pressedCall = false;
        this.pressedRaise = false;
    }

    //TODO genauer machen mit meheren (number[]))
    private checkHand(cards: Card[]): number {
        if (this.hasRoyalFlush(cards)) {
            return 9;
        }
        else if (this.hasStraightFlush(cards)) {
            return 8;
        }
        else if (this.hasQuadruple(cards)) {
            return 7;
        }
        else if (this.hasFullHouse(cards)) {
            return 6;
        }
        else if (this.hasFlush(cards)) {
            return 5;
        }
        else if (this.hasStraight(cards)) {
            return 4;
        }
        else if (this.hasTripple(cards)) {
            return 3;
        }
        else if (this.hasPair(cards)) {
            return 2;
        }
        else if (this.hasHighCard(cards)) {
            return 1;
        }
        return -1;
    }

    private hasRoyalFlush(cards: Card[]): boolean {
        return true;
    }

    private hasStraightFlush(cards: Card[]): boolean {
        return true;
    }

    private hasQuadruple(cards: Card[]): boolean {
        for(let i: number = 0; i < cards.length; i++)
        {
            for(let j: number = i; j < cards.length; j++)
            {
                for(let k: number = j; k < cards.length; k++)
                {
                    for(let l: number = k; l < cards.length; l++)
                    {
                        if(cards[i].value == cards[j].value && cards[j].value == cards[k].value && cards[k].value == cards[l].value)
                        {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private hasFullHouse(cards: Card[]): boolean {
        return true;
    }

    private hasFlush(cards: Card[]): boolean {
        return true;
    }

    private hasStraight(cards: Card[]): boolean {
        return true;
    }

    private hasTripple(cards: Card[]): boolean {
        for(let i: number = 0; i < cards.length; i++)
        {
            for(let j: number = i; j < cards.length; j++)
            {
                for(let k: number = j; k < cards.length; k++)
                {
                    if(cards[i].value == cards[j].value && cards[j].value == cards[k].value)
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private hasPair(cards: Card[]): boolean {
        for(let i: number = 0; i < cards.length; i++)
        {
            for(let j: number = i; j <cards.length; j++)
            {
                if(cards[i].value == cards[j].value)
                    return true;
            }
        }
        return false;
    }

    //unnötig
    private hasHighCard(cards: Card[]): boolean {
       return true;
    }
}