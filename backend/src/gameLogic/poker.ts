import { DEALER_ID } from "./deck";
import { Player } from "./player";
import { CardGame } from "./cardGame";
import { PokerDeck } from "./pokerDeck";
import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";
import { PokerPlayer } from "./pokerPlayer";

export const MAX_PLAYER_COUNT: number = 5;
export const PLAYER_CARDS_NUMBER: number = 2;
export const POKER_CARDS_NUMBER: number = 5;
export const POKER_DESK_ID: string = "PokerDesk";

export class Poker extends CardGame<PokerPlayer> {

    private pokerDeck: PokerDeck;
    private pokerDeskCards: Card[];

    constructor() {
        super();
        this.pokerDeck = new PokerDeck();
        this.pokerDeskCards = [];
        this.startGame();
    }

    private startGame() {
        this.setDealerChip();
        this.handCardsOut();
        this.setDeafaultBets();
        this.playRound();
    }

    private nextRound() {
        this.resetCards();
        this.resetBets();
        //überprüfen ob pleite
        this.updateDealerChip();
        this.handCardsOut();
        this.setDeafaultBets();
        this.playRound();
    }


    private handCardsOut() {
        if (this.players.length === 0) return;
        const dealerIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j: number = 0; j < this.players.length; j++) {
                this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), j)]
                    .addCard(this.pokerDeck.dealCard(this.pokerDeck.getDeck(), this.players[j].getPlayerId()), this.players[j].getPlayerId());
            }
        }

        for (let i: number = 0; i < POKER_CARDS_NUMBER; i++) {
            this.pokerDeskCards.push(this.pokerDeck.dealCard(this.pokerDeck.getDeck(), POKER_DESK_ID));
        }
    }

    private resetCards() {
        for (let i: number = 0; i < this.pokerDeskCards.length; i++) {
            this.pokerDeskCards[i].owner = DEALER_ID;
        }
        for (const player of this.players) {
            player.clearHand();
        }
    }

    private playRound() {
        //betting
        //open 3 cards in the middle
        //betting
        //open one card
        //betting
        //open one card
        //betting
        //check winner
        //distribute profits
        this.nextRound();
    }
}
