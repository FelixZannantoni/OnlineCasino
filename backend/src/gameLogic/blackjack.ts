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
    private isRunning: boolean = false;

    constructor(gameId: string) {
        super(gameId);
        this.blackjackDeck = new BlackjackDeck();
        this.blackJackBot = new BlackjackBot();
    }

    public async startGame() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.setDefaultDealerChip();
        
        while (this.isRunning && this.players.length > 0) {
            await this.playRound();
            this.updateDealerChip();
            // Wait a bit before next round
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        this.isRunning = false;
    }

    public stopGame() {
        this.isRunning = false;
    }

    private async playRound() {
        this.resetBets();
        this.resetCards();
        this.blackjackDeck = new BlackjackDeck(); // New deck for each round

        this.makeBets();
        
        // Only players who made a bet participate
        const activePlayers = this.players.filter(p => p.getBet() > 0);
        if (activePlayers.length === 0 && this.players.length > 0) {
            return;
        }

        this.handCardsOut();
        this.checkHandsValue();

        if (!this.blackJackBot.hasBlackJack()) {
            await this.makeMove();
        }
        
        this.dealerPlay();
        this.handOutWin();
    }

    private dealerPlay() {
        while (this.blackJackBot.makesHit()) {
            this.blackJackBot.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), BALCKJACK_BOT_ID));
        }
    }

    private handCardsOut() {
        if (this.players.length === 0) return;

        const dealerChipIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j: number = 0; j < this.players.length; j++) {
                const playerIndex = Player.xNextPlayer(this.players, dealerChipIndex, j + 1);
                const player = this.players[playerIndex];
                if (player.getBet() > 0) {
                    player.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), player.getPlayerId()));
                }
            }
        }

        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            this.blackJackBot.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), BALCKJACK_BOT_ID));
        }
    }

    private resetCards() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].clearHand();
        }
        this.blackJackBot.clearHand();
    }

    private checkHandsValue() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].checkHandValue();
        }
    }

    private async makeMove() {
        const dealerChipIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < this.players.length; i++) {
            const playerIndex = Player.xNextPlayer(this.players, dealerChipIndex, i + 1);
            const playerOnMove: BlackjackPlayer = this.players[playerIndex];

            // Only active players move
            if (playerOnMove.getBet() === 0) continue;
            // If player has Blackjack, they stand automatically
            if (playerOnMove.getHandValue() === 21 && playerOnMove.getCards().length === 2) continue;

            let turnOver = false;
            while (!turnOver && playerOnMove.getHandValue() < 21) {
                await new Promise<void>((resolve) => {
                    const timeout = setTimeout(() => {
                        this.removeListener("playerMove", handleMove);
                        turnOver = true;
                        resolve();
                    }, 10000);

                    const handleMove = (detail: { playerId: string }) => {
                        if (detail && detail.playerId == playerOnMove.getPlayerId()) {
                            if (playerOnMove.getMadeMove()) {
                                clearTimeout(timeout);
                                this.removeListener("playerMove", handleMove);
                                
                                if (playerOnMove.getPressedStand()) {
                                    turnOver = true;
                                }
                                else if (playerOnMove.getPressedHit()) {
                                    playerOnMove.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), playerOnMove.getPlayerId()));
                                    playerOnMove.checkHandValue();
                                    if (playerOnMove.getHandValue() >= 21) {
                                        turnOver = true;
                                    }
                                }
                                else if (playerOnMove.getPressedDouble()) {
                                    // Double Down
                                    const currentBet = playerOnMove.getBet();
                                    try {
                                        playerOnMove.makeIncreasedBet(currentBet * 2);
                                        playerOnMove.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), playerOnMove.getPlayerId()));
                                        playerOnMove.checkHandValue();
                                    } catch (e) {
                                        // If not enough money, maybe just hit? For now just end turn.
                                    }
                                    turnOver = true;
                                }
                                playerOnMove.resetMadeMove();
                                resolve();
                            }
                        }
                    };

                    this.on("playerMove", handleMove);
                });
            }
        }
    }

    private makeBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            const desiredBet: number = this.players[i].getDesiredBet();
            if (desiredBet > 0) {
                try {
                    this.players[i].makeNewBet(desiredBet);
                } catch (e) {
                    // Not enough money
                    this.players[i].makeNewBet(0);
                }
            } else {
                this.players[i].makeNewBet(0);
            }
        }
    }

    private resetBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].makeIncreasedBet(0);
        }
    }

    private handOutWin() {
        const botValue = this.blackJackBot.getHandValue();
        const botBusted = botValue > 21;
        const botHasBlackjack = this.blackJackBot.hasBlackJack();

        for (let i: number = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const playerBet = player.getBet();
            if (playerBet === 0) continue;

            const playerValue = player.getHandValue();
            const playerBusted = playerValue > 21;
            const playerHasBlackjack = playerValue === 21 && player.getCards().length === 2;

            if (playerBusted) {
                continue;
            }

            if (botHasBlackjack) {
                if (playerHasBlackjack) {
                    // Push
                    player.winMoney(playerBet);
                } else {
                    // Loss
                }
            } else if (playerHasBlackjack) {
                // Blackjack pays 3:2
                player.winMoney(playerBet * 2.5);
            } else if (botBusted || playerValue > botValue) {
                // Win pays 1:1
                player.winMoney(playerBet * 2);
            } else if (playerValue === botValue) {
                // Push
                player.winMoney(playerBet);
            } else {
                // Loss
            }
        }
    }
}