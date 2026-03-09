import { Game } from "./game";
import { Player } from "./player";
import { Card } from "../model";

export class CardGame extends Game {

    constructor() {
        super();
    }

    protected setDealerChip()
    {
        this.players[Math.floor(Math.random() * this.players.length) + 1].setDealerChip(true);
    }

    protected updateDealerChip()
    {
        for(let i: number = 0; i < this.players.length; i++)
           {
            if(this.players[i].getDealerChip() == true)
            {
                this.players[i].setDealerChip(false);
                this.players[Player.nextPlayer(this.players, i)].setDealerChip(true);
            }
        }
    }

    protected setDeafaultBets()
    {
        this.players[Player.playerWithDealerChip(this.players)].setBet(0);
        //TODO
    }
}
