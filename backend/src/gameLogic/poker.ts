import { CardVisibility, DEALER_ID } from "./deck";
import { Player } from "./player";
import { CardGame } from "./cardGame";
import { PokerDeck } from "./pokerDeck";
import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";
import { PokerPlayer } from "./pokerPlayer";
import { pokerService, userService } from "../app";

export const MAX_PLAYER_COUNT: number = 5;
export const PLAYER_CARDS_NUMBER: number = 2;
export const POKER_CARDS_NUMBER: number = 5;
export const POKER_DESK_ID: string = "PokerDesk";

type GamePhase = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export class Poker extends CardGame<PokerPlayer> {

    private pokerDeck: PokerDeck;
    private board: Card[] = [];
    private defaultBet: number = 10;
    private currentBet: number = 0;
    private pot: number = 0;

    private phase: GamePhase = 'pre-flop';
    private currentPlayerIndex: number = 0;
    private isStarted: boolean = false;
    private hasActedThisRound: Set<string> = new Set();

    private isLoading: boolean = false;
    private turnTimer: NodeJS.Timeout | null = null;
    private turnEndTime: number | null = null;
    private readonly TURN_TIMEOUT_MS: number = 10000; // 10 seconds for Poker

    constructor(gameId: string) {
        super(gameId);
        this.pokerDeck = new PokerDeck();
    }

    public handlePlayerDisconnect(playerId: string) {
        console.log(`Player ${playerId} disconnected from Poker game ${this.getGameId()}`);
        const currentPlayer = this.players[this.currentPlayerIndex];
        if (currentPlayer && currentPlayer.getPlayerId() === playerId) {
            console.log(`It was player ${playerId}'s turn. Auto-folding...`);
            this.handlePlayerMove(playerId, "fold");
        }
    }

    public async tipDealer(playerId: string) {
        const player = this.players.find(p => p.getPlayerId() === playerId);
        if (!player) return { success: false, message: "Player not found" };
        try {
            player.makeTip(10);
            await userService.updateUserBalance(playerId, player.getBalance());
            this.emit("gameState", this.getGameState());
            return { success: true, message: "Dealer: Thank you for the tip!" };
        } catch (e) {
            return { success: false, message: "Not enough money to tip" };
        }
    }

    private startTurnTimer() {
        this.stopTurnTimer();
        const currentPlayer = this.players[this.currentPlayerIndex];
        if (!currentPlayer) return;

        this.turnEndTime = Date.now() + this.TURN_TIMEOUT_MS;
        console.log(`Starting turn timer for player ${currentPlayer.getPlayerId()} (Ends at: ${new Date(this.turnEndTime).toLocaleTimeString()})`);
        
        this.turnTimer = setTimeout(() => {
            console.log(`Turn timeout for player ${currentPlayer.getPlayerId()}. Auto-folding...`);
            this.handlePlayerMove(currentPlayer.getPlayerId(), "fold");
        }, this.TURN_TIMEOUT_MS);
    }

    private stopTurnTimer() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
        this.turnEndTime = null;
    }

    public startGame() {
        if (this.isStarted) return;
        this.isStarted = true;
        // Clean up any existing dealer chips to ensure only one exists
        this.players.forEach(p => p.setDealerChip(false));
        this.setDefaultDealerChip();
        this.startNewHand(true);
    }

    private startNewHand(isFirstHand: boolean = false) {
        if (this.players.length < 2) {
            this.isStarted = false;
            this.stopTurnTimer();
            // Clean up dealer chips if game can't start
            this.players.forEach(p => p.setDealerChip(false));
            return;
        }

        this.isLoading = false;
        if (!isFirstHand) {
            this.updateDealerChip();
        }
        this.pokerDeck = new PokerDeck();
        this.board = [];
        this.pot = 0;
        this.currentBet = this.defaultBet;
        this.phase = 'pre-flop';
        this.hasActedThisRound.clear();

        this.resetPlayers();
        this.handCardsOut();
        this.setInitialBlinds();

        // Im Pre-Flop beginnt der Spieler nach dem Big Blind
        const dealerIdx = CardGamePlayer.playerWithDealerChip(this.players);
        if (this.players.length === 2) {
            // Heads-up: Dealer ist Small Blind, der andere Big Blind
            this.currentPlayerIndex = dealerIdx;
        } else {
            const bigBlindIdx = Player.xNextPlayer(this.players, dealerIdx, 2);
            this.currentPlayerIndex = Player.nextPlayer(this.players, bigBlindIdx);
        }

        this.startTurnTimer();
        this.emit("gameState", this.getGameState());
    }

    private resetPlayers() {
        this.players.forEach(p => {
            p.clearHand();
            p.makeNewBet(0);
            p.setFolded(false);
            p.resetMadeMove();
            p.resetHandValue();
        });
    }

    private handCardsOut() {
        // 2 Karten pro Spieler
        for (let i = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j = 0; j < this.players.length; j++) {
                const playerIdx = Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), j);
                this.players[playerIdx].addCard(this.pokerDeck.dealCard(this.pokerDeck.getDeck(), this.players[playerIdx].getPlayerId()));
            }
        }

        // Board Karten (verdeckt)
        for (let i = 0; i < POKER_CARDS_NUMBER; i++) {
            const card = this.pokerDeck.dealCard(this.pokerDeck.getDeck(), POKER_DESK_ID);
            card.visibility = CardVisibility.none;
            this.board.push(card);
        }
    }

    private setInitialBlinds() {
        const dealerIdx = CardGamePlayer.playerWithDealerChip(this.players);

        if (this.players.length === 2) {
            // Heads-up Regeln
            const sbIdx = dealerIdx;
            const bbIdx = Player.nextPlayer(this.players, dealerIdx);

            this.players[sbIdx].makeNewBet(this.defaultBet / 2);
            this.players[bbIdx].makeNewBet(this.defaultBet);
        } else {
            const sbIdx = Player.nextPlayer(this.players, dealerIdx);
            const bbIdx = Player.xNextPlayer(this.players, dealerIdx, 2);

            this.players[sbIdx].makeNewBet(this.defaultBet / 2);
            this.players[bbIdx].makeNewBet(this.defaultBet);
        }

        this.currentBet = this.defaultBet;
        this.pot = (this.defaultBet * 1.5);
    }

    private nextPhase() {
        this.resetBettingRound();

        switch (this.phase) {
            case 'pre-flop':
                this.reveal(3); // Flop
                this.phase = 'flop';
                break;
            case 'flop':
                this.reveal(4); // Turn
                this.phase = 'turn';
                break;
            case 'turn':
                this.reveal(5); // River
                this.phase = 'river';
                break;
            case 'river':
                this.phase = 'showdown';
                this.handleShowdown();
                return;
        }
        
        this.checkPlayersHands();
        this.emit("gameState", this.getGameState());
    }

    private reveal(count: number) {
        for (let i = 0; i < count; i++) {
            this.board[i].visibility = CardVisibility.all;
        }
        this.checkPlayersHands();
    }

    private checkPlayersHands() {
        const visibleBoard = this.board.filter(c => c.visibility === CardVisibility.all);
        this.players.forEach(p => {
            if (!p.getPressedFold()) {
                p.checkHand([...p.getCards(), ...visibleBoard]);
            }
        });
    }

    private resetBettingRound() {
        this.currentBet = 0;
        this.hasActedThisRound.clear();
        this.players.forEach(p => p.makeNewBet(0));

        // Nach dem Flop beginnt der erste aktive Spieler links vom Dealer
        const dealerIdx = CardGamePlayer.playerWithDealerChip(this.players);
        this.currentPlayerIndex = dealerIdx;
        this.moveToNextActivePlayer(); // Moves to the first active player after dealer

        this.startTurnTimer();
        this.emit("gameState", this.getGameState());
    }

    private handleShowdown() {
        this.stopTurnTimer();
        this.checkPlayersHands();

        let highestValue = -1;
        let winners: PokerPlayer[] = [];

        this.players.forEach(p => {
            if (!p.getPressedFold()) {
                const comboValue = p.getCardCombinationValue();
                const tieBreaker = p.getValueOfCardCombination();

                if (comboValue > highestValue) {
                    highestValue = comboValue;
                    winners = [p];
                } else if (comboValue === highestValue) {
                    const currentWinnerTie = winners[0].getValueOfCardCombination();
                    if (tieBreaker > currentWinnerTie) {
                        winners = [p];
                    } else if (tieBreaker === currentWinnerTie) {
                        winners.push(p);
                    }
                }
            }
        });

        const winAmount = this.pot / winners.length;
        winners.forEach(w => w.winMoney(winAmount));

        this.isLoading = true;
        this.emit("gameState", this.getGameState());

        setTimeout(() => {
            this.startNewHand();
        }, 5000);
    }

    public async handlePlayerMove(playerId: string, action: string, amount?: number) {
        const player = this.players[this.currentPlayerIndex];

        if (!player || player.getPlayerId() !== playerId) {
            return { success: false, message: "Not your turn" };
        }

        this.stopTurnTimer();

        let success = true;
        let message = "ok";

        switch (action) {
            case "fold":
                player.setFolded(true);
                break;

            case "check":
                if (player.getBet() < this.currentBet) {
                    this.startTurnTimer();
                    return { success: false, message: "Cannot check, must call or raise" };
                }
                break;

            case "call":
                const diff = this.currentBet - player.getBet();
                if (diff > 0) {
                    try {
                        player.makeIncreasedBet(this.currentBet);
                        this.pot += diff;
                    } catch (e) {
                        // All-in call
                        const remaining = player.getBalance();
                        player.makeIncreasedBet(player.getBet() + remaining);
                        this.pot += remaining;
                    }
                }
                break;

            case "bet":
            case "raise":
                const betAmount = amount || 0;
                if (betAmount <= 0) {
                    this.startTurnTimer();
                    return { success: false, message: "Invalid amount" };
                }

                const totalNewBet = this.currentBet + betAmount;
                const additionalContribution = totalNewBet - player.getBet();

                try {
                    player.makeIncreasedBet(totalNewBet);
                    this.currentBet = totalNewBet;
                    this.pot += additionalContribution;
                    this.hasActedThisRound.clear();
                } catch (e) {
                    this.startTurnTimer();
                    return { success: false, message: "Not enough money" };
                }
                break;

            default:
                this.startTurnTimer();
                return { success: false, message: "Unknown action" };
        }

        this.hasActedThisRound.add(playerId);
        await userService.updateUserBalance(playerId, player.getBalance());

        const activePlayers = this.players.filter(p => !p.getPressedFold());
        if (activePlayers.length === 1) {
            activePlayers[0].winMoney(this.pot);
            this.isLoading = true;
            this.emit("gameState", this.getGameState());
            setTimeout(() => this.startNewHand(), 3000);
            return { success: true, message: "Only one player left" };
        }

        if (this.isRoundFinished()) {
            this.nextPhase();
        } else {
            this.moveToNextActivePlayer();
            this.startTurnTimer();
        }

        this.emit("gameState", this.getGameState());
        return { success: success, message: message };
    }

    private moveToNextActivePlayer() {
        let tries = 0;
        const totalPlayers = this.players.length;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % totalPlayers;
            tries++;
            // Skip players who folded OR are all-in (unless it's the start of the round and they need to check/call)
            const p = this.players[this.currentPlayerIndex];
            if (!p.getPressedFold() && p.getBalance() > 0) return;
        } while (tries < totalPlayers);
    }

    private isRoundFinished(): boolean {
        const activePlayers = this.players.filter(p => !p.getPressedFold());
        const needsToAct = activePlayers.filter(p => p.getBalance() > 0);

        if (needsToAct.length === 0) return true;

        const allActed = needsToAct.every(p => this.hasActedThisRound.has(p.getPlayerId()));
        const allMatched = needsToAct.every(p => p.getBet() === this.currentBet || p.getBalance() === 0);

        return allActed && allMatched;
    }

    public getGameState() {
        const now = Date.now();
        const turnRemainingSeconds = this.turnEndTime ? Math.max(0, Math.round((this.turnEndTime - now) / 1000)) : null;

        return {
            gameId: this.getGameId(),
            phase: this.phase,
            pot: this.pot,
            currentBet: this.currentBet,
            turnEndsAt: this.turnEndTime,
            turnRemainingSeconds: turnRemainingSeconds,
            players: this.players.map(p => ({
                id: p.getPlayerId(),
                username: p.getUsername(),
                displayname: p.getDisplayname(),
                bet: p.getBet(),
                desiredBet: p.getDesiredBet(),
                folded: p.getPressedFold(),
                balance: p.getBalance(),
                cards: p.getCards(),
                isDealer: p.getDealerChip(),
                handValue: p.getCardCombinationValue(),
                handName: this.getHandName(p.getCardCombinationValue())
            })),
            board: this.board,
            currentPlayerId: this.players[this.currentPlayerIndex]?.getPlayerId() ?? null,
            isLoading: this.isLoading
        };
    }

    private getHandName(value: number): string {
        switch (value) {
            case 1: return "High Card";
            case 2: return "Pair";
            case 3: return "Two Pair";
            case 4: return "Three of a Kind";
            case 5: return "Straight";
            case 6: return "Flush";
            case 7: return "Full House";
            case 8: return "Four of a Kind";
            case 9: return "Straight Flush";
            case 10: return "Royal Flush";
            default: return "";
        }
    }
}