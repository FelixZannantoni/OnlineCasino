import { BlackjackBot } from "./blackjackBot";
import { BlackjackDeck } from "./blackjackDeck";
import { BlackjackPlayer } from "./blackjackPlayer";
import { CardGame } from "./cardGame";
import { CardGamePlayer } from "./cardGamePlayer";
import { Player } from "./player";

export const PLAYER_CARDS_NUMBER: number = 2;
export const BALCKJACK_BOT_ID: string = "BlackjackBot";


export class Blackjack extends CardGame<BlackjackPlayer> {
    private blackjackDeck: BlackjackDeck;
    private blackJackBot: BlackjackBot;

    constructor(gameId: string) {
        super(gameId);
        this.blackjackDeck = new BlackjackDeck();
        this.blackJackBot = new BlackjackBot;
        this.startGame();
    }

    private handCardsOut() {
        if (this.players.length === 0) return;

        const dealerIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j: number = 0; j < this.players.length; j++) {
                this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), j)]
                    .addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), this.players[j].getPlayerId()));
            }//TODO dealCard änder visibility auf all
        }

        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            this.blackJackBot.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), BALCKJACK_BOT_ID));
        }
    }

    private checkHandsValue() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].checkHandValue(this.players[i].getCards());
        }
    }

    private makeMove() {
        for (let i: number = 0; i < this.players.length; i++) {
            const playerOnMove: BlackjackPlayer = this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), i)];
            if (playerOnMove.getPressedStand() == true) {
            }
            else if (playerOnMove.getPressedHit() == true) {
                playerOnMove.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), playerOnMove.getPlayerId()));
                playerOnMove.checkHandValue(playerOnMove.getCards());//TODO Methode so machen das kein getCards benötigt wird
                if(playerOnMove.getHandsValue() == 21) {//TODO checkHandsVAlue muus in getHandsValue aufgereufen werden

                }
                else if(playerOnMove.getHandsValue() > 21) {

                }
            }
            else if (playerOnMove.getPressedDouble() == true) {

            }
            else {

            }

        }
    }

    private makeBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            const bet: number = this.players[i].getDesiredBet();
            this.players[i].setBet(bet);
            if(bet == 0){
                //TODO player darf runde nicht mitspielen
            }
        }
    }

    private startGame() {

    }

    private nextRound() {

        this.playRound();
    }

    private playRound() {
        this.makeBets();
        this.handCardsOut();
        this.checkHandsValue();
        this.makeMove();
        this.nextRound();
    }

}