import { PockerDeck } from "./deck";
import { Player } from "./player";
import {Card} from "../model";

export const MAX_PLAYER_COUNT: number = 5;
export const PLAYER_CARDS_NUMBER: number = 2;
export const POKER_CARDS_NUMBER: number = 5;
export const POKER_DESK_ID: string = "PokerDesk";


export class startRound
{
    private pockerDeck: PockerDeck;
    private players: Player[];
    private pokerDeskCards: Card[];

    constructor()
    {
        this.pockerDeck = new PockerDeck();
        this.players = [];
        this.pokerDeskCards = [];
        this.giveCardsOut();
        this.setDealerChip();
    }

    private giveCardsOut()
    {
        for(let i:number = 0; i < PLAYER_CARDS_NUMBER; i++)
        {
            for(let player of this.players)
            {
                player.addCard(this.pockerDeck.dealCard(this.pockerDeck.getDeck(), player.playerId), player.playerId);
            }
        }
        
        for(let i: number = 0; i < POKER_CARDS_NUMBER; i++)
        {
            this.pokerDeskCards.push(this.pockerDeck.dealCard(this.pockerDeck.getDeck(),POKER_DESK_ID));
        }
    }

    private setDealerChip()
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
}
