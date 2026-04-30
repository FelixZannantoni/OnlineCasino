import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";

export class BlackjackPlayer extends CardGamePlayer {
    private pressedHit: boolean;
    private pressedStand: boolean;
    private pressedDouble: boolean;
    private handValue: number;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedHit = false;
        this.pressedStand = false;
        this.pressedDouble = false;
        this.handValue = 0;
    }

    public getHandValue(): number {
        this.checkHandValue();
        return this.handValue;
    }

    public getPressedHit(): boolean {
        return this.pressedHit;
    }

    public getPressedStand(): boolean {
        return this.pressedStand;
    }

    public getPressedDouble(): boolean {
        return this.pressedDouble;
    }

    public userPressedHit() {
        this.resetActions();
        this.pressedHit = true;
        this.resetActions;
    }

    public userPressedStand() {
        this.resetActions();
        this.pressedStand = true;
        this.resetActions;
    }

    private userPressedDouble() {
        this.resetActions();
        this.pressedDouble = true;
        this.resetActions;
    }

    private resetActions(): void {
        this.pressedHit = false;
        this.pressedStand = false;
        this.pressedDouble = false;
    }

    public checkHandValue() {
        this.handValue = 0;
        for (let i: number = 0; i < this.cards.length; i++) {
            this.handValue += this.cards[i].value;
        }
    }
}