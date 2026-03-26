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

    public getHandsValue(): number {
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

    public setPressedHit(pressedHit: boolean) {
        if (pressedHit) this.resetActions();
        this.pressedHit = pressedHit;
    }

    public setPressedStand(pressedStand: boolean) {
        if (pressedStand) this.resetActions();
        this.pressedStand = pressedStand;
    }

    private setPressedDouble(pressedDouble: boolean) {
        if (pressedDouble) this.resetActions();
        this.pressedDouble = pressedDouble;
    }

    private resetActions(): void {
        this.pressedHit = false;
        this.pressedStand = false;
        this.pressedDouble = false;
    }

    public checkHandValue(cards: Card[]) {
        this.handValue = 0;
        for (let i: number = 0; i < cards.length; i++) {
            this.handValue += cards[i].value;
        }
    }
}