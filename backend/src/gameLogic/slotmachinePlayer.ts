import { GamePlayer } from "./gamePlayer"

export class SlotmachinePlayer extends GamePlayer {

    private pressedSpin: boolean;
    private pressedAutoSpin: boolean;
    private currentBet: number;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedSpin = false;
        this.pressedAutoSpin = false;
        this.currentBet = 0;
    }

    public getPressedSpin(): boolean {
        return this.pressedSpin;
    }

    public getPressedAutoSpin(): boolean {
        return this.pressedAutoSpin;
    }

    public userPressedSpin(): void {
        this.resetActions();
        this.pressedSpin = true;
    }

    public userPressedAutoSpin(): void {
        this.resetActions();
        this.pressedAutoSpin = true;
    }

    private resetActions(): void {
        this.pressedSpin = false;
        this.pressedAutoSpin = false;
    }
}