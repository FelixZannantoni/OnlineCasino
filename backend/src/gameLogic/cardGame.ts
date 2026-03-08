import { Game } from "./game";
import { Deck } from "./deck";
import { Player } from "./player";
import { Card } from "../model";

export class CardGame extends Game {
    protected deskCards: Card[];

    constructor() {
        super();
        this.deskCards = [];
    }

    protected setDealerChip()
    {
        this.players[Math.floor(Math.random() * this.players.length) + 1].hasDealerChip = true
    }

    protected updateDealerChip()
    {
        for(let i: number = 0; i < this.players.length; i++)
           {
            if(this.players[i].hasDealerChip == true)
            {
                this.players[i].hasDealerChip = false;
                this.players[Player.nextPlayer(this.players, i)].hasDealerChip = true;
            }
        }
    }

    protected deafaultBets()
    {
        this.players[Player.playerWithDealerChip(this.players)].bet = 0;
        //TODO
    }
}
