import { Card } from "../model";
import { BlackjackDeck } from "./blackjackDeck";
import { BlackjackPlayer } from "./blackjackPlayer";
import { CardGame } from "./cardGame";
import { CardGamePlayer } from "./cardGamePlayer";
import { Deck } from "./deck";
import { Player } from "./player";

export const PLAYER_CARDS_NUMBER: number = 2;
export const BALCKJACK_BOT_ID: string = "BlackjackBot";

export class Blackjack extends CardGame<BlackjackPlayer> {
    private blackjackDeck: BlackjackDeck;

    constructor() {
        super();
        this.blackjackDeck = new BlackjackDeck();
        this.startGame();
    }

    private startGame() {

    }

    private nextRound() {

        this.handCardsOut();
    }

    private playRound() {

        this.nextRound();
    }

    private handCardsOut() {
        if (this.players.length === 0) return;

        const dealerIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j: number = 0; j < this.players.length; j++) {
                this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), j)]
                    .addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), this.players[j].getPlayerId()), this.players[j].getPlayerId());
            }
        }
    }
}