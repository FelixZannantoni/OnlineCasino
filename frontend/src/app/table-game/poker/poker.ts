import { Component, Inject, PLATFORM_ID, signal, computed, inject, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableGameComponent } from '../table-game';
import { MatIconModule } from '@angular/material/icon';
import { SocketService } from '../../services/socket.service';
import { DataService } from '../../services/data-service';
import { DevTeam } from "../../settings-overlay/dev-team/dev-team";
import { PokerPlayersComponent } from './poker-players/poker-players';
import { getCardRank } from '../../services/card-utils';

type PokerBoardCard = {
  name: string;
  value: number;
  color: string;
  owner: string;
  visibility: 'player' | 'hidden' | 'all' | string;
};

type PokerPlayerState = {
  id: string;
  displayname: string;
  bet: number;
  desiredBet: number;
  folded: boolean;
  balance: number;
  cards: PokerBoardCard[];
  isDealer: boolean;
  handName: string;
  handValue: number;
};

type PokerGameState = {
  gameId: string;
  phase: string;
  pot: number;
  currentBet: number;
  players: PokerPlayerState[];
  board: PokerBoardCard[];
  currentPlayerId: string | null;
  isLoading: boolean;
  turnRemainingSeconds: number | null;
  gameStartRemainingSeconds: number | null;
};

@Component({
  selector: 'app-poker',
  standalone: true,
  imports: [CommonModule, TableGameComponent, MatIconModule],
  templateUrl: './poker.html',
  styleUrls: ['./poker.css'],
})
export class Poker implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly socketService = inject(SocketService);
  protected readonly dataService = inject(DataService);

  balance = 1000;
  pot = 0;

  public gameState = signal<PokerGameState | null>(null);
  protected isProcessing = signal<boolean>(false);
  protected turnRemaining = signal<number | null>(null);
  protected gameStartsIn = signal<number | null>(null);
  private playerTurnTimer: any = null;
  private gameStartTimer: any = null;

  flippingCards = new Set<string>();
  private revealedCards = new Set<string>();

  private readonly gameId = signal<string>('1');

  protected readonly getCardRank = getCardRank;

  // Local state for the betting UI
  protected selectedBetAmount = signal<number>(20);
  protected showBetSlider = signal<boolean>(false);

  protected readonly minBet = computed(() => {
    const state = this.gameState();
    if (!state) return 10;
    // Standard raise is usually at least currentBet + bigBlind (10)
    return Math.max(10, state.currentBet + 10);
  });

  protected readonly maxBet = computed(() => {
    const me = this.myPlayer();
    if (!me) return 1000;
    return me.balance;
  });

  protected readonly myPlayer = computed(() => {
    const state = this.gameState();
    if (!state) return null;
    return state.players.find(p => p.id === this.dataService.userId()) || null;
  });

  protected readonly opponents = computed(() => {
    const state = this.gameState();
    if (!state) return [];
    // Alle Spieler, die NICHT ich sind
    return state.players.filter(p => p.id !== this.dataService.userId());
  });

    ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = this.route.snapshot.paramMap.get('id') ?? '1';
    this.gameId.set(id);
    const userId = this.dataService.userId();

    if (!userId) {
      console.warn("No user logged in. Cannot join game.");
      return;
    }

    this.socketService.onEvent('game_state', (state: unknown) => {
      const s = state as PokerGameState;
      this.gameState.set(s);
      this.isProcessing.set(false);

      // Handle Timer
      if (s.turnRemainingSeconds !== null) {
        this.turnRemaining.set(s.turnRemainingSeconds);
        this.startLocalTimerForPlayerTurn();
      } else {
        this.stopLocalTimerForPlayerTurn();
      }

      if (s.gameStartRemainingSeconds != null) {
        this.gameStartsIn.set(s.gameStartRemainingSeconds);
        this.startLocalTimerForGameStart();
      }

      // Keep table-game bindings in sync
      if (typeof s?.pot === 'number') this.pot = s.pot;
      
      const me = s.players.find((p) => p.id === userId);
      if (me) {
        if (typeof me.balance === 'number') this.balance = me.balance;
        if (me.desiredBet !== this.selectedBetAmount()) {
          this.selectedBetAmount.set(me.desiredBet || this.minBet());
        }
      }

      // Pause Overlay Logic: only show overlay at round end (winning hand)
      this.handlePauseOverlayLogic(s);
    });

    this.socketService.joinGame(id, userId);
  }

  private handlePauseOverlayLogic(s: PokerGameState): void {
    // Show overlay only when server marks the game as loading and provides lastWinners
    // (this indicates a round has finished and winners are available).
    if (s.isLoading && (s as any).lastWinners && (s as any).lastWinners.length > 0) {
      const lastWinners = (s as any).lastWinners as { id: string, handName: string }[];
      const winnerInfo = lastWinners[0]; // show primary winner (if split pot, first entry)
      const winnerPlayer = s.players.find(p => p.id === winnerInfo.id) || null;

      window.dispatchEvent(new CustomEvent('togglePauseOverlay', {
        detail: {
          title: 'Gewinner!',
          message: `${winnerPlayer?.displayname || 'Spieler'} gewinnt mit ${winnerInfo.handName || winnerPlayer?.handName || 'Gewinnende Hand'}`,
          timerSeconds: 5,
          boardCards: s.board,
          winnerCards: winnerPlayer?.cards || [],
          handName: winnerInfo.handName || winnerPlayer?.handName
        }
      }));
      return;
    }

    // Otherwise close overlay
    window.dispatchEvent(new CustomEvent('togglePauseOverlay', {
      detail: { isOpen: false, title: '', message: '' }
    }));
  }

  private startLocalTimerForPlayerTurn(): void {
    if (this.playerTurnTimer) clearInterval(this.playerTurnTimer);
    this.playerTurnTimer = setInterval(() => {
      this.turnRemaining.update(v => v !== null && v > 0 ? v - 1 : 0);
    }, 1000);
  }

  private startLocalTimerForGameStart(): void {
    if (this.gameStartTimer) clearInterval(this.gameStartTimer);
    this.gameStartTimer = setInterval(() => {
      this.gameStartsIn.update(v => v != null && v > 0 ? v - 1 : 0);
    }, 1000);
  }

  private stopLocalTimerForPlayerTurn(): void {
    if (this.playerTurnTimer) {
      clearInterval(this.playerTurnTimer);
      this.playerTurnTimer = null;
    }
    this.turnRemaining.set(null);
  }

  private getMyPlayer(): PokerPlayerState | null {
    const state = this.gameState();
    if (!state) return null;

    const meId = this.dataService.userId();
    return state.players.find((p) => p.id === meId) ?? null;
  }

  protected isMyTurn = computed(() => {
    const state = this.gameState();
    if (!state) return false;
    return state.currentPlayerId === this.dataService.userId();
  });

  makeMove(action: 'fold' | 'check' | 'call' | 'bet' | 'raise', amount?: number): void {
    const gid = this.gameId();
    if (!gid) return;

    this.isProcessing.set(true);
    this.socketService.emitEvent('player_move', {
      gameId: gid,
      action,
      amount,
    });
  }

  private setBetAmount(amount: number): void {
    this.selectedBetAmount.set(amount);
    this.socketService.emitEvent('set_desired_bet', {
      gameId: this.gameId(),
      amount: amount
    });
  }

  updateBetAmount(event: Event): void {
    const amount = parseInt((event.target as HTMLInputElement).value, 10);
    this.setBetAmount(amount);
  }

  makeCheckOrCall(): void {
    const state = this.gameState();
    const me = this.getMyPlayer();
    if (!state || !me) return;

    // if already matched -> check, else call
    if (me.bet === state.currentBet) {
      this.makeMove('check');
    } else {
      this.makeMove('call');
    }
  }

  checkOrCallLabel(): string {
    const state = this.gameState();
    const me = this.getMyPlayer();
    if (!state || !me) return 'Check';

    if (me.bet === state.currentBet) {
      return 'Check';
    } else {
      const callAmount = state.currentBet - me.bet;
      return `Call ${callAmount}`;
    }
  }

  makeBetOrRaise(): void {
    const state = this.gameState();
    if (!state) return;

    const totalBet = this.selectedBetAmount();
    // In Poker, 'bet' and 'raise' amounts in handlePlayerMove are increments
    const increment = totalBet - state.currentBet;

    if (state.currentBet === 0) {
      this.makeMove('bet', totalBet);
    } else {
      this.makeMove('raise', increment);
    }
  }

  toggleBetSlider(): void {
    if (!this.isMyTurn()) return;
    this.showBetSlider.update(v => !v);
  }

  confirmBet(): void {
    this.makeBetOrRaise();
    this.showBetSlider.set(false);
  }

  setHalfPot(): void {
    const state = this.gameState();
    if (!state) return;
    const amount = Math.max(this.minBet(), Math.min(this.maxBet(), Math.floor(state.pot / 2)));
    this.setBetAmount(amount);
  }

  setPot(): void {
    const state = this.gameState();
    if (!state) return;
    const amount = Math.max(this.minBet(), Math.min(this.maxBet(), state.pot));
    this.setBetAmount(amount);
  }

  setAllIn(): void {
    this.setBetAmount(this.maxBet());
  }

  betOrRaiseLabel(): string {
    const state = this.gameState();
    if (!state) return 'Bet';
    return state.currentBet === 0 ? 'Bet' : 'Raise';
  }

  tipDealer(): void {
    const gid = this.gameId();
    if (!gid) return;

    this.socketService.emitEvent('tip_dealer', {
      gameId: gid
    });
  }
  private triggerFlipsForNewlyRevealedCards(newState: PokerGameState): void {
    if (newState.phase === 'PRE_FLOP' || newState.phase === 'WAITING') this.revealedCards.clear();
    newState.board.forEach((card, i) => {
      const key = `board-${i}`;
      if (card.visibility === 'all' && !this.revealedCards.has(key)) {
        this.revealedCards.add(key);
        this.triggerFlip(key);
      }
    });
    newState.players.forEach(player => {
      player.cards.forEach((card, i) => {
        const key = `player-${player.id}-${i}`;
        if (card.visibility === 'all' && !this.revealedCards.has(key)) {
          this.revealedCards.add(key);
          this.triggerFlip(key);
        }
      });
    });
  }

  private triggerFlip(key: string): void {
    this.flippingCards.add(key);
    setTimeout(() => this.flippingCards.delete(key), 520);
  }

  isFlipping(key: string): boolean {
    return this.flippingCards.has(key);
  }

}