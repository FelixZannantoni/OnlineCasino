import { BlackjackBot } from "./blackjackBot";
import { BlackjackDeck } from "./blackjackDeck";
import { BlackjackPlayer } from "./blackjackPlayer";
import { CardGame } from "./cardGame";
import { CardGamePlayer } from "./cardGamePlayer";
import { Player } from "./player";

export const PLAYER_CARDS_NUMBER: number = 2;
export const BLACKJACK_BOT_ID: string = "BlackjackBot";

export enum BlackjackPhase {
    WAITING = "WAITING",
    BETTING = "BETTING",
    PLAYING = "PLAYING",
    DEALER_TURN = "DEALER_TURN",
    FINISHED = "FINISHED"
}

export class Blackjack extends CardGame<BlackjackPlayer> {
    private blackjackDeck: BlackjackDeck;
    private blackJackBot: BlackjackBot;
    private isRunning: boolean = false;
    private currentPhase: BlackjackPhase = BlackjackPhase.WAITING;
    private currentPlayerId: string | null = null;

    constructor(gameId: string) {
        super(gameId);
        this.blackjackDeck = new BlackjackDeck();
        this.blackJackBot = new BlackjackBot();
        this.defaultTurnTimeoutMs = 15000; // Blackjack uses 15s
    }

    public async startGame() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.setDefaultDealerChip();

        while (this.isRunning) {
            if (this.players.length === 0) {
                // Wait a bit to see if someone joins, or just stop
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (this.players.length === 0) break;
            }

            await this.playRound();
            this.updateDealerChip();
            this.currentPhase = BlackjackPhase.FINISHED;
            this.emit("gameState", this.getGameState());
            // Wait a bit before next round
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        this.isRunning = false;
        this.currentPhase = BlackjackPhase.WAITING;
        this.emit("gameState", this.getGameState());
    }

    public stopGame() {
        this.isRunning = false;
    }

    private async playRound() {
        this.resetBets();
        this.resetCards();
        this.blackjackDeck = new BlackjackDeck(); // New deck for each round

        this.currentPhase = BlackjackPhase.BETTING;
        await this.waitForBets();

        // Only players who made a bet participate
        const activePlayers = this.players.filter(p => p.getBet() > 0);
        if (activePlayers.length === 0) {
            return;
        }

        this.currentPhase = BlackjackPhase.PLAYING;
        this.handCardsOut();
        this.checkHandsValue();
        this.emit("gameState", this.getGameState());

        if (!this.blackJackBot.hasBlackJack()) {
            await this.makeMove();
        }

        this.currentPhase = BlackjackPhase.DEALER_TURN;
        this.currentPlayerId = BLACKJACK_BOT_ID;

        // Skip dealer play if all active players busted
        const anyPlayerStillIn = this.players.some(p => p.getBet() > 0 && p.getHandValue() <= 21);
        if (anyPlayerStillIn) {
            this.dealerPlay();
        } else {
            this.blackJackBot.revealCards(); // Just reveal the hidden card
        }

        this.emit("gameState", this.getGameState());
        this.handOutWin();
        this.currentPlayerId = null;
    }

    private dealerPlay() {
        this.blackJackBot.revealCards();
        while (this.blackJackBot.makesHit()) {
            this.blackJackBot.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), BLACKJACK_BOT_ID));
        }
    }

    private handCardsOut() {
        if (this.players.length === 0) return;

        const dealerChipIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j: number = 0; j < this.players.length; j++) {
                const playerIndex = Player.xNextPlayer(this.players, dealerChipIndex, j + 1);
                const player = this.players[playerIndex];
                if (player && player.getBet() > 0) {
                    player.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), player.getPlayerId()));
                }
            }
        }

        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            this.blackJackBot.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), BLACKJACK_BOT_ID));
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

    public override removePlayer(playerId: string): void {
        const index = this.players.findIndex(p => p.getPlayerId() === playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
            this.emit("playerLeft", { playerId });
            this.emit("gameState", this.getGameState());
        }
    }

    private async makeMove() {
        const dealerChipIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < this.players.length; i++) {
            const playerIndex = Player.xNextPlayer(this.players, dealerChipIndex, i + 1);
            const playerOnMove: BlackjackPlayer = this.players[playerIndex];

            // Only active players move
            if (!playerOnMove || playerOnMove.getBet() === 0) continue;
            // If player has Blackjack, they stand automatically
            if (playerOnMove.getHandValue() === 21 && playerOnMove.getCards().length === 2) continue;

            this.currentPlayerId = playerOnMove.getPlayerId();
            let turnOver = false;
            while (!turnOver && playerOnMove.getHandValue() < 21) {
                this.emit("gameState", this.getGameState());
                await new Promise<void>((resolve) => {
                    this.startTurnTimer(this.defaultTurnTimeoutMs, () => {
                        turnOver = true;
                        resolve();
                    });

                    const handleMove = (detail: { playerId: string }) => {
                        if (detail && detail.playerId == playerOnMove.getPlayerId()) {
                            if (playerOnMove.getMadeMove()) {
                                this.stopTurnTimer();
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
                                    const currentBet = playerOnMove.getBet();
                                    try {
                                        playerOnMove.makeIncreasedBet(currentBet * 2);
                                        playerOnMove.addCard(this.blackjackDeck.dealCard(this.blackjackDeck.getDeck(), playerOnMove.getPlayerId()));
                                        playerOnMove.checkHandValue();
                                    } catch (e) { }
                                    turnOver = true;
                                }
                                playerOnMove.resetMadeMove();
                                this.emit("gameState", this.getGameState());
                                resolve();
                            }
                        }
                    };

                    const handleRemoval = (detail: { playerId: string }) => {
                        if (detail && detail.playerId === playerOnMove.getPlayerId()) {
                            this.stopTurnTimer();
                            turnOver = true;
                            resolve();
                        }
                    };

                    this.on("playerMove", handleMove);
                    this.on("playerLeft", handleRemoval);
                });

                // Check if player was removed during the wait
                if (!this.players.find(p => p.getPlayerId() === playerOnMove.getPlayerId())) {
                    turnOver = true;
                }
            }
        }
        this.currentPlayerId = null;
        this.stopTurnTimer();
    }

    private async waitForBets() {
        // Automatically apply desired bets for players who have them
        for (const player of this.players) {
            const desired = player.getDesiredBet();
            if (desired > 0) {
                try {
                    player.makeNewBet(desired);
                } catch (e) {
                    // Not enough money for desired bet, player will have to bet manually
                }
            }
        }

        this.emit("gameState", this.getGameState());

        // Wait for all players to place a bet or timeout
        await new Promise<void>((resolve) => {
            this.startTurnTimer(this.defaultTurnTimeoutMs, () => {
                resolve();
            });

            const handleBet = () => {
                const allBet = this.players.every(p => p.getBet() > 0 || p.getBalance() === 0);
                if (allBet) {
                    this.stopTurnTimer();
                    resolve();
                }
                this.emit("gameState", this.getGameState());
            };

            const handleLeft = () => {
                // If a player leaves, re-check if everyone else has bet
                handleBet();
            };

            this.on("playerBet", handleBet);
            this.on("playerLeft", handleLeft);

            handleBet();
        });
        this.stopTurnTimer();
    }

    public handlePlayerMove(playerId: string, action: string, amount?: number) {
        const player = this.players.find(p => p.getPlayerId() === playerId);
        if (!player) return { success: false, message: "Player not found" };

        if (action === "bet") {
            if (this.currentPhase !== BlackjackPhase.BETTING) {
                return { success: false, message: "Not in betting phase" };
            }
            if (amount === undefined || amount <= 0) {
                return { success: false, message: "Invalid bet amount" };
            }
            try {
                player.makeNewBet(amount);
                this.emit("playerBet", { playerId });
                return { success: true, message: "Bet placed" };
            } catch (e) {
                return { success: false, message: "Not enough balance" };
            }
        }

        if (this.currentPhase !== BlackjackPhase.PLAYING || this.currentPlayerId !== playerId) {
            return { success: false, message: "Not your turn or wrong phase" };
        }

        switch (action) {
            case "hit":
                player.userPressedHit();
                break;
            case "stand":
                player.userPressedStand();
                break;
            case "double":
                if (player.getCards().length !== 2) {
                    return { success: false, message: "Can only double on first move" };
                }
                if (player.getBalance() < player.getBet()) {
                    return { success: false, message: "Not enough balance to double" };
                }
                player.userPressedDouble();
                break;
            default:
                return { success: false, message: "Invalid action" };
        }

        this.emit("playerMove", { playerId });
        return { success: true, message: "Action received" };
    }

    public getGameState() {
        const botVisibleCards = this.blackJackBot.getCards();
        const botHandValue = (this.currentPhase === BlackjackPhase.DEALER_TURN || this.currentPhase === BlackjackPhase.FINISHED)
            ? this.blackJackBot.getHandValue()
            : (botVisibleCards.length > 1 ? botVisibleCards[1].value : 0);

        return {
            gameId: this.getGameId(),
            isRunning: this.isRunning,
            phase: this.currentPhase,
            currentPlayerId: this.currentPlayerId,
            turnEndsAt: this.turnEndTime,
            turnRemainingSeconds: this.getTurnRemainingSeconds(),
            players: this.players.map(p => ({
                id: p.getPlayerId(),
                username: p.getUsername(),
                displayname: p.getDisplayname(),
                balance: p.getBalance(),
                bet: p.getBet(),
                cards: p.getCards(),
                handValue: p.getHandValue(),
                isDealer: p.getDealerChip()
            })),
            bot: {
                id: BLACKJACK_BOT_ID,
                cards: botVisibleCards,
                handValue: botHandValue
            }
        };
    }

    private makeBets() {
        // This is now handled by waitForBets and handlePlayerMove("bet")
    }

    private resetBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].makeNewBet(0);
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