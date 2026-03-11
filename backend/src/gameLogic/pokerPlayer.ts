import { CardGamePlayer } from "./cardGamePlayer";

export class PokerPlayer extends CardGamePlayer {
    private pressedFold: boolean;
    private pressedCheck: boolean;
    private pressedBet: boolean;
    private pressedCall: boolean;
    private pressedRaise: boolean;

    constructor(playerId: string, username: string, displayname: string, balance: number, hasDealerChip: boolean, bet: number) {
        super(playerId, username, displayname, balance, hasDealerChip, bet);
        this.pressedFold = false;
        this.pressedCheck = false;
        this.pressedBet = false;
        this.pressedCall = false;
        this.pressedRaise = false;
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
}
