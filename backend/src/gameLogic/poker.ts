import { CardVisibility, DEALER_ID } from "./deck";
import { Player } from "./player";
import { CardGame } from "./cardGame";
import { PokerDeck } from "./pokerDeck";
import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";
import { PokerPlayer } from "./pokerPlayer";

export const MAX_PLAYER_COUNT = 5;
export const PLAYER_CARDS_NUMBER = 2;
export const POKER_CARDS_NUMBER = 5;

type GamePhase = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export class Poker extends CardGame<PokerPlayer> {

    private deck: PokerDeck;
    private board: Card[] = [];

    private pot = 0;
    private defaultBet = 10;
    private currentBet = 0;

    private phase: GamePhase = 'pre-flop';
    private currentPlayerIndex = 0;

    constructor(gameId: string) {
        super(gameId);
        this.deck = new PokerDeck();
    }

    private isStarted = false;
    public startGame() {
        if(this.isStarted) return;
        this.isStarted = true;
        this.startNewHand();
        this.emit("gameState", this.getGameState());
    }

    private startNewHand() {
        this.isStarted = true;

        if(this.players.length >= 2) {
            this.moveDealerChip();
        }

        this.deck = new PokerDeck();
        this.board = [];
        this.pot = 0;
        this.currentBet = 0;
        this.phase = 'pre-flop';

        this.resetPlayers();
        this.dealCards();
        this.initBlinds();

        const dealerIdx = CardGamePlayer.playerWithDealerChip(this.players);
        const bigBlindIdx = Player.xNextPlayer(this.players, dealerIdx, 2);
        this.currentPlayerIndex = Player.nextPlayer(this.players, bigBlindIdx);

        this.emit("gameState", this.getGameState());
    }

    private resetPlayers() {
        this.players.forEach(p => {
            p.clearHand();
            p.setBet(0);
            p.setFolded(false);
        });
    }

    private moveDealerChip() {
        if (this.players.length === 0) return;

        const currentDealerIdx = CardGamePlayer.playerWithDealerChip(this.players);

        // alten Dealer entfernen
        this.players[currentDealerIdx].setDealerChip(false);

        // nächsten Spieler als Dealer setzen
        const nextDealerIdx = Player.nextPlayer(this.players, currentDealerIdx);

        this.players[nextDealerIdx].setDealerChip(true);
    }

    private dealCards() {
        // 2 cards each player
        for (let i = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (const p of this.players) {
                p.addCard(this.deck.dealCard(this.deck.getDeck(), p.getPlayerId()));
            }
        }

        // board
        for (let i = 0; i < POKER_CARDS_NUMBER; i++) {
            const card = this.deck.dealCard(this.deck.getDeck(), "board");
            card.visibility = CardVisibility.none;
            this.board.push(card);
        }
    }

    private initBlinds() {
        if (this.players.length < 2) return;

        const dealerIdx = CardGamePlayer.playerWithDealerChip(this.players);
        const smallBlindIdx = Player.nextPlayer(this.players, dealerIdx);
        const bigBlindIdx = Player.xNextPlayer(this.players, dealerIdx, 2);

        this.players[smallBlindIdx].setBet(this.defaultBet / 2);
        this.players[bigBlindIdx].setBet(this.defaultBet);

        this.currentBet = this.defaultBet;
        this.pot += this.defaultBet + this.defaultBet / 2;
    }

    private nextPhase() {

        this.resetBettingRound();

        switch (this.phase) {
            case 'pre-flop':
                this.reveal(3);
                this.phase = 'flop';
                break;

            case 'flop':
                this.reveal(4);
                this.phase = 'turn';
                break;

            case 'turn':
                this.reveal(5);
                this.phase = 'river';
                break;

            case 'river':
                this.reveal(5);
                this.phase = 'showdown';

                this.resolveWinner();

                this.emit("gameState", this.getGameState());

                setTimeout(() => {
                    this.startNewHand();
                }, 5000);

                return;
        }

        this.emit("gameState", this.getGameState());
    }

    private reveal(count: number) {
        for (let i = 0; i < count; i++) {
            this.board[i].visibility = CardVisibility.all;
        }
    }

    private resetBettingRound() {
        this.currentBet = 0;
        this.hasActedThisRound.clear(); // hasActed zurücksetzen bei neuer Runde
        this.players.forEach(p => p.setBet(0));
        
        const dealerIdx = CardGamePlayer.playerWithDealerChip(this.players);
        this.currentPlayerIndex = Player.nextPlayer(this.players, dealerIdx);
    }

    private getCurrentPlayer(): PokerPlayer {
        return this.players[this.currentPlayerIndex];
    }

    private nextPlayer() {
        let tries = 0;

        do {
            this.currentPlayerIndex =
                (this.currentPlayerIndex + 1) % this.players.length;

            tries++;
            if (tries > this.players.length) break;

        } while (this.players[this.currentPlayerIndex].getPressedFold());
    }

    private hasActedThisRound: Set<string> = new Set();
    private isRoundFinished(): boolean {
        const activePlayers = this.players.filter(p => !p.getPressedFold());

        if(activePlayers.length <= 1) {
            return true;
        }

        const allMatchedBet = activePlayers.every(p => p.getBet() === this.currentBet);

        const allActed = activePlayers.every(p => this.hasActedThisRound.has(p.getPlayerId()));

        return allMatchedBet && allActed;
    }

    public handlePlayerMove(playerId: string, action: string, amount?: number) {

        const player = this.getCurrentPlayer();

        if (player.getPlayerId() !== playerId) {
            return { success: false, message: "Not your turn" };
        }

        this.hasActedThisRound.add(player.getPlayerId()); // Spieler als hat gehandelt markieren
        switch (action) {

            case "fold":
                player.setFolded(true);
                break;

            case "check":
                if (player.getBet() !== this.currentBet) {
                    return { success: false, message: "Cannot check" };
                }
                break;

            case "bet":
                if(this.currentBet > 0) {
                    return {
                        success: false,
                        message: 'Use raise instead of bet!'
                    };
                }

                if (!amount || amount <= 0) {
                    return {
                        success: false, 
                        message: "Invalid bet" 
                    };
                }
                    

                player.setBet(amount);
                this.currentBet = amount;
                this.pot += amount;
                break;

            case "call":
                const diff = this.currentBet - player.getBet();
                if (diff <= 0) {
                    return {
                        success: false,
                        message: 'Nothing to call'
                    };
                }
                player.setBet(this.currentBet);
                this.pot += diff;
                break;

            case "raise":
                if(this.currentBet === 0) {
                    return {
                        success: false,
                        message: 'Use bet instead of raise!'
                    };
                }

                if (!amount || amount <= 0) {
                    return { 
                        success: false,
                        message: "Invalid raise"
                     };
                }

                const minRaise = this.defaultBet;

                if(amount < minRaise) {
                    return {
                        success: false,
                        message: `Minimum raise is ${minRaise}`
                    };
                }

                const newBet = this.currentBet + amount;
                const add = newBet - player.getBet();

                player.setBet(newBet);
                this.currentBet = newBet;
                this.pot += add;

                // Alle anderen müssen jetzt wieder reagieren
                this.hasActedThisRound.clear();
                this.hasActedThisRound.add(player.getPlayerId());

                break;
        }

        const activePlayers: PokerPlayer[] = this.players.filter(p => !p.getPressedFold());

        if(activePlayers.length === 1) {
            activePlayers[0].winMoney(this.pot);
            this.emit("gameState", this.getGameState());

            setTimeout(() => {
                this.startNewHand();
            }, 3000);

            return {
                success: true,
                message: "Only one player left"
            }
        }

        this.nextPlayer();

        // if all players have the same current bet, move to next phase
        if (this.isRoundFinished()) {
            this.nextPhase();
        }

        this.emit("gameState", this.getGameState());
        return { success: true, message: "ok" };
    }

    // Winner logic: best hand wins, split pot on ties
    private resolveWinner() {
        let best = -1;
        let winners: PokerPlayer[] = [];

        for (const p of this.players) {
            if (p.getPressedFold()) continue;

            const combined = [...p.getCards(), ...this.board.filter(c => c.visibility === CardVisibility.all)];
            p.checkHand(combined);

            const score = p.getCardCombinationValue();

            if (score > best) {
                best = score;
                winners = [p];
            } else if (score === best) {
                winners.push(p);
            }
        }

        const share = this.pot / winners.length;
        winners.forEach(w => w.winMoney(share));
    }

    public getGameState() {
        return {
            gameId: this.getGameId(),
            phase: this.phase,
            pot: this.pot,
            currentBet: this.currentBet,

            players: this.players.map(p => ({
                id: p.getPlayerId(),
                name: p.getUsername(),
                bet: p.getBet(),
                folded: p.getPressedFold(),
                balance: p.getBalance(),
                cards: p.getCards()
            })),

            board: this.board,
            currentPlayerId: this.players[this.currentPlayerIndex]?.getPlayerId() ?? null
        };
    }
}