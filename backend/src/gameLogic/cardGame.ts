import { Game } from "./game";
import { Player } from "./player";
import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";

export class CardGame extends Game {

    private players: CardGamePlayer[];
    
    constructor() {
        super();
        this.players = [];
    }

    protected setDealerChip() {
        this.players[Math.floor(Math.random() * this.players.length) + 1].setDealerChip(true);
    }

    protected updateDealerChip() {
        for (let i: number = 0; i < this.players.length; i++) {
            if (this.players[i].getDealerChip() == true) {
                this.players[i].setDealerChip(false);
                this.players[Player.nextPlayer(this.players, i)].setDealerChip(true);
            }
        }
    }

    protected resetBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].setBet(0);
        }
    }

    protected setDeafaultBets() {
        this.resetBets();
        this.players[CardGamePlayer.playerWithDealerChip(this.players)].setBet(0);
        this.players[Player.nextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players))].setBet(0);
        if (this.players.length >= 3) {
            this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), 2)].setBet(0);
        }

        //TODO set bet auf halb und ganz
    }

    protected bet() {

    }
}
