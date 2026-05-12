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
        this.blackJackBot = new BlackjackBot();
    }

    private startGame() {
        this.setDefaultDealerChip();
        this.playRound();
    }

    private nextRound() {
        this.resetBets();
        this.resetCards();
        this.updateDealerChip();
        this.playRound();
    }

    private playRound() {
        this.makeBets();
        this.handCardsOut();
        this.checkHandsValue();
        if (this.blackJackBot.hasBlackJack()) {
            //TODO BlackjackBot Blackjack
        }
        this.makeMove();
        this.handOutWin();
        this.nextRound();
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

    private resetCards() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].clearHand();
        }
    }

    private checkHandsValue() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].checkHandValue();
        }
    }

    private async makeMove() {
        for (let i: number = 0; i < this.players.length; i++) {
            const playerOnMove: BlackjackPlayer = this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), i)];
            await new Promise<void>((resolve) => {
                const timeout = setTimeout(() => {
                    this.removeListener("playerMove", handleMove);
                    resolve();
                }, 5000);

                const handleMove = (detail: { playerId: string }) => {
                    if (detail && detail.playerId == playerOnMove.getPlayerId()) {
                        if (playerOnMove.getMadeMove()) {
                            clearTimeout(timeout);
                            this.removeListener("playerMove", handleMove);
                            if (playerOnMove.getPressedStand() == true) {
                            }
                            else if (playerOnMove.getPressedHit() == true) {
                                playerOnMove.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), playerOnMove.getPlayerId()));
                                if (playerOnMove.getHandValue() < 21) {
                                    i--;
                                }

                            }
                            else if (playerOnMove.getPressedDouble() == true) {
                                //TODO Player bekommt ein neues Deck
                            }
                            else {

                            }
                        }
                    }
                };

                this.on("playerMove", handleMove);
            });

        }
        while (this.blackJackBot.makesHit()) {
            this.blackJackBot.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), BALCKJACK_BOT_ID));
        }
    }

    private makeBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            const bet: number = this.players[i].getDesiredBet();
            this.players[i].makeIncreasedBet(bet);
            if (bet == 0) {
                //TODO player darf runde nicht mitspielen
            }
        }
    }

    private resetBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].makeIncreasedBet(0);
        }
    }

    private handOutWin() {
        for (let i: number = 0; i < this.players.length; i++) {
            const playerOnMove: BlackjackPlayer = this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), i)];
            if (playerOnMove.getHandValue() == this.blackJackBot.getHandValue()) {
                playerOnMove.winMoney(playerOnMove.getBet());
            }
            else if (playerOnMove.getHandValue() > this.blackJackBot.getHandValue()) {
                if (playerOnMove.getCards().length == 2 && playerOnMove.getHandValue() == 21) {
                    playerOnMove.winMoney((playerOnMove.getBet() * 2, 5));
                }
                playerOnMove.winMoney((playerOnMove.getBet() * 2));
            }
        }
    }
}