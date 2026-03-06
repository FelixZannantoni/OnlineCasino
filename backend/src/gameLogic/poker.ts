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
    private players: Player[];
    private pokerDeskCards: Card[];

    constructor()
    {
        super();
        this.pokerDeck = new PokerDeck();
        this.players = [];
        this.pokerDeskCards = [];
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
            this.pokerDeskCards.push(this.pokerDeck.dealCard(this.pokerDeck.getDeck(),POKER_DESK_ID));
        }
    }

    setDealerChip()
    {
        this.players[Math.floor(Math.random() * this.players.length) + 1].hasDealerChip = true
    }

    private updateDealerChip()
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

    resetCards()
    {
        for(let i: number = 0; i < this.pokerDeskCards.length; i++)
        {
            this.pokerDeskCards[i].owner = DEALER_ID;
        }
        for(const player of this.players)
        {
            player.clearHand();
        }
    }

    private deafaultBets()
    {
        this.players[Player.playerWithDealerChip(this.players)].bet = 0;
    }
}