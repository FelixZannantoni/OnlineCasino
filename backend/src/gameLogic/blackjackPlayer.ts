import { Card } from "../model";
import { CardVisibility } from "./deck";
import { CardGamePlayer } from "./cardGamePlayer";

export class BlackjackPlayer extends CardGamePlayer {
    private pressedHit: boolean;
    private pressedStand: boolean;
    private pressedDouble: boolean;
    private handValue: number;
    private busted: boolean;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedHit = false;
        this.pressedStand = false;
        this.pressedDouble = false;
        this.handValue = 0;
        this.busted = false;
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

    public isBusted(): boolean {
        return this.busted;
    }

    public userPressedHit() {
        this.resetActions();
        this.pressedHit = true;
        this.madeMove = true;
    }

    public userPressedStand() {
        this.resetActions();
        this.pressedStand = true;
        this.madeMove = true;
    }

    public userPressedDouble() {
        this.resetActions();
        this.pressedDouble = true;
        this.madeMove = true;
    }

    public override addCard(card: Card): void {
        this.cards.push(card);
        card.visibility = CardVisibility.all;
    }

    private resetActions(): void {
        this.pressedHit = false;
        this.pressedStand = false;
        this.pressedDouble = false;
        this.madeMove = false;
    }

    public userBusted(): void {
        this.busted = true;
    }

    public resetBust(): void {
        this.busted = false;
    }

    public checkHandValue() {
        this.handValue = 0;
        let aceCount = 0;
        for (let i: number = 0; i < this.cards.length; i++) {
            this.handValue += this.cards[i].value;
            if (this.cards[i].name === "ace") {
                aceCount++;
            }
        }

        while (this.handValue > 21 && aceCount > 0) {
            this.handValue -= 10;
            aceCount--;
        }
    }
}