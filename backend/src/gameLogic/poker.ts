import { DEALER_ID } from "./deck";
import { Player } from "./player";
import {Card} from "../model";
import {CardGame} from "./cardGame";
import { PokerDeck } from "./pokerDeck";

export const MAX_PLAYER_COUNT: number = 5;
export const PLAYER_CARDS_NUMBER: number = 2;
export const POKER_CARDS_NUMBER: number = 5;
export const POKER_DESK_ID: string = "PokerDesk";


export class Poker extends CardGame
{
    private pokerDeck: PokerDeck;

    constructor()
    {
        super();
        this.pokerDeck = new PokerDeck();
    }

    private startGame()
    {
        this.setDealerChip();
        this.handCardsOut();
    }

    private nextRound()
    {
        this.resetCards();
        this.updateDealerChip();
        this.handCardsOut();
    }
   

    private handCardsOut()
    {
        for(let i:number = 0; i < PLAYER_CARDS_NUMBER; i++)
        {
            for(let j: number = 0; j < this.players.length; j++)
            {
                this.players[Player.xNextPlayer(this.players, Player.playerWithDealerChip(this.players), j)]
                    .addCard(this.pokerDeck.dealCard(this.pokerDeck.getDeck(), this.players[j].playerId), this.players[j].playerId);
            }
        }
        
        for(let i: number = 0; i < POKER_CARDS_NUMBER; i++)
        {
            this.deskCards.push(this.pokerDeck.dealCard(this.pokerDeck.getDeck(),POKER_DESK_ID));
        }
    }

    resetCards()
    {
        for(let i: number = 0; i < this.deskCards.length; i++)
        {
            this.deskCards[i].owner = DEALER_ID;
        }
        for(const player of this.players)
        {
            player.clearHand();
        }
    }
}