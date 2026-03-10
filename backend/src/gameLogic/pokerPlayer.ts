import { CardGamePlayer } from "./cardGamePlayer";

export class PokerPlayer extends CardGamePlayer {
    constructor(playerId: string, username: string, displayname: string, balance: number, hasDealerChip: boolean, bet: number) {
        super(playerId, username, displayname, balance, hasDealerChip, bet);
    }
}
