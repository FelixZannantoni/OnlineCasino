import { PockerDeck } from "./deck";
import { Player } from "./player";
export class startRound
{
    private pockerDeck: PockerDeck;
    private players: Player[];

    constructor()
    {
        this.pockerDeck = new PockerDeck();
        this.players = [];
        this.giveCardsOut();
    }

    private giveCardsOut()
    {
        for(let i:number = 0; i < 2; i++)
        {
            for(let player of this.players)
            {
                player.addCard(this.pockerDeck.drawCard(this.pockerDeck.getCardDeck(), player.playerId), player.playerId);   
            }
        }
    }
}
