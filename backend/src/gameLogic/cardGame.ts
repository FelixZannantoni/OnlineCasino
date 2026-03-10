import { Game } from "./game";
import { Player } from "./player";
import { CardGamePlayer } from "./cardGamePlayer";

export class CardGame<T extends CardGamePlayer = CardGamePlayer> extends Game<T> {

    constructor() {
        super();
    }

    protected setDealerChip() {
        this.players[Math.floor(Math.random() * this.players.length) + 1].setDealerChip(true);
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
