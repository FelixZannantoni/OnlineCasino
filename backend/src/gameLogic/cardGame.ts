import { Game } from "./game";
import { Player } from "./player";
import { CardGamePlayer } from "./cardGamePlayer";

export class CardGame<T extends CardGamePlayer = CardGamePlayer> extends Game<T> {

    constructor(gameId: string) {
        super(gameId);
    }

    protected setDefaultDealerChip() {
        console.log("in set deafault dealerchip");
        this.players[Math.floor(Math.random() * this.players.length) + 1].setDealerChip(true);
        console.log("sucesfully set dealerchipt");
    }

    protected updateDealerChip() {
        for (let i: number = 0; i < this.players.length; i++) {
            if (this.players[i].getDealerChip() == true) {
                this.players[i].setDealerChip(false);
                this.players[Player.nextPlayer(this.players, i)].setDealerChip(true);
                return;
            }
        }
    }
}