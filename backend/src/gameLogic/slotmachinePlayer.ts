import { Player } from "./player"

export class slotmachinePlayer extends Player {

    private pressedSpin: boolean;
    private pressedAutoSpin: boolean;


    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedSpin = false;
        this.pressedAutoSpin = false;
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