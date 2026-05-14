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

    constructor(gameId: string) {
        super(gameId);
        this.pokerDeck = new PokerDeck();
    }

    public startGame() {
        if (this.isStarted) return;
        this.isStarted = true;
        this.setDefaultDealerChip();
        this.startNewHand(true);
    }

    private startNewHand(isFirstHand: boolean = false) {
        if (this.players.length < 2) {
            this.isStarted = false;
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

        this.emit("gameState", this.getGameState());
    }

    private handleShowdown() {
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

        if (player.getPlayerId() !== playerId) {
            return { success: false, message: "Not your turn" };
        }

        let success = true;
        let message = "ok";

        switch (action) {
            case "fold":
                player.setFolded(true);
                break;

            case "check":
                if (player.getBet() < this.currentBet) {
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
                    return { success: false, message: "Not enough money" };
                }
                break;

            default:
                return { success: false, message: "Unknown action" };
        }

        this.hasActedThisRound.add(playerId);
        await userService.updateUserBalance(playerId, player.getBalance());

        const activePlayers = this.players.filter(p => !p.getPressedFold());
        if (activePlayers.length === 1) {
            activePlayers[0].winMoney(this.pot);
            this.emit("gameState", this.getGameState());
            setTimeout(() => this.startNewHand(), 3000);
            return { success: true, message: "Only one player left" };
        }

        if (this.isRoundFinished()) {
            this.nextPhase();
        } else {
            this.moveToNextActivePlayer();
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
            // In a real poker game, all-in players are skipped for the rest of the hand.
            const p = this.players[this.currentPlayerIndex];
            if (!p.getPressedFold() && p.getBalance() > 0) return;
        } while (tries < totalPlayers);
    }

    private isRoundFinished(): boolean {
        const activePlayers = this.players.filter(p => !p.getPressedFold());
        const needsToAct = activePlayers.filter(p => p.getBalance() > 0);

        if (needsToAct.length === 0) return true;

        const allActed = needsToAct.every(p => this.hasActedThisRound.has(p.getPlayerId()));
        const allMatched = needsToAct.every(p => p.getBet() === this.currentBet);

        return allActed && allMatched;
    }

    public getGameState() {
        return {
            gameId: this.getGameId(),
            phase: this.phase,
            pot: this.pot,
            currentBet: this.currentBet,
            players: this.players.map(p => ({
                id: p.getPlayerId(),
                username: p.getUsername(),
                displayname: p.getDisplayname(),
                bet: p.getBet(),
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