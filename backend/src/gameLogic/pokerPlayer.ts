import { CardGamePlayer } from "./cardGamePlayer";

export class PokerPlayer extends CardGamePlayer {
    private pressedFold: boolean;
    private pressedCheck: boolean;
    private pressendBet: boolean;
    private pressedCall: boolean;
    private pressedRaise: boolean;

    constructor(playerId: string, username: string, displayname: string, balance: number, hasDealerChip: boolean, bet: number, pressedFold: boolean, pressedCheck: boolean, pressendBet: boolean, pressedCall: boolean, pressedRaise: boolean) {
        super(playerId, username, displayname, balance, hasDealerChip, bet);
        this.pressedFold = pressedFold;
        this.pressedCheck = pressedCheck;
        this.pressendBet = pressendBet;
        this.pressedCall = pressedCall;
        this.pressedRaise = pressedRaise;
    }
}
