import { Component, OnInit, OnDestroy, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TableGameComponent } from '../table-game';
import { SocketService } from '../../services/socket.service';
import { DataService } from '../../services/data-service';
import { BlackjackGameState, BlackjackPlayer } from '../../models/blackjack.models';
import { getCardRank } from '../../services/card-utils';
import { getBetLimits, getChipOptions, getModeConfigByMode } from '../../game-mode-overlay/game-mode-overlay';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [CommonModule, TableGameComponent, FormsModule],
  templateUrl: './blackjack.html',
  styleUrl: './blackjack.css',
})
export class Blackjack implements OnInit, OnDestroy {
  gameState = signal<BlackjackGameState | null>(null);
  userId: string | null = null;
  gameId: string = '2'; // Default
  gameName: string = 'Blackjack';
  betAmount: number = 10;
  balance: number = 1000;
  pot: number = 0;
  private isBrowser: boolean;
  protected turnRemaining = signal<number | null>(null);
  private timerInterval: any = null;
  // Chip betting UI (copied from roulette)
  interfaceChipOptions: any; // placeholder to keep typings simple in this file
  readonly selectedChip = signal(10);
  readonly chipOptions = signal<any[]>([
    { value: 1, cls: 'ch1' },
    { value: 5, cls: 'ch5' },
    { value: 25, cls: 'ch25' },
    { value: 100, cls: 'ch100' },
    { value: 500, cls: 'ch500' },
  ]);

  // Keys of cards currently playing their flip animation
  flippingCards = new Set<string>();
  // Keys of cards that have already been revealed (so we don't re-flip)
  private revealedCards = new Set<string>();

  protected readonly me = computed(() => {
    const state = this.gameState();
    if (!state) return null;
    return state.players.find(p => p.id === this.userId) || null;
  });

  protected readonly opponents = computed(() => {
    const state = this.gameState();
    if (!state) return [];
    return state.players.filter(p => p.id !== this.userId);
  });

  constructor(
  private socketService: SocketService,
  private dataService: DataService,
  private route: ActivatedRoute,
  @Inject(PLATFORM_ID) private platformId: Object
  ) {
  this.isBrowser = isPlatformBrowser(this.platformId);
  this.userId = this.dataService.getUserId();
  const modeParam = this.route.snapshot.queryParamMap.get('mode') ?? 'low';
  const modeConfig = getModeConfigByMode(modeParam);
  this.gameId = modeConfig.blackjackId; // e.g., 'blackjack-low'

  // Use a unique ID for the game room, but pass the name for mode detection
  this.gameName = `Blackjack ${modeParam}`; 
  }

  ngOnInit() {
  if (!this.isBrowser) return;

  const modeParam = this.route.snapshot.queryParamMap.get('mode') ?? 'low';
  const { minBet, maxBet } = getBetLimits(modeParam);
  this.betAmount = minBet;
  this.chipOptions.set(getChipOptions(minBet, maxBet));
  const stakes = this.route.snapshot.queryParamMap.get('stakes') || undefined;

  if (this.userId) {
    // Pass both ID and a descriptive name
    this.socketService.joinGame(this.gameId, this.userId, stakes, `Blackjack ${modeParam}`);
  }
  // ...

    this.socketService.onEvent('game_state', (data: any) => {
      console.log('Blackjack State Update:', data);
      const state = data as BlackjackGameState;
      if (state.chipOptions) {
        this.chipOptions.set(state.chipOptions);
      }
      this.triggerFlipsForNewlyRevealedCards(state);
      this.gameState.set(state);

      // Handle Timer (Poker style)
      if (state.turnRemainingSeconds != null) {
        this.turnRemaining.set(state.turnRemainingSeconds);
        this.startLocalTimer();
      } else {
        this.stopLocalTimer();
      }

      const me = state.players.find(p => p.id === this.userId);
      if (me) {
        if (typeof me.balance === 'number') this.balance = me.balance;
        if (typeof me.bet === 'number') this.pot = me.bet;
      }
    });

    this.socketService.onEvent('error', (data: any) => {
      console.error('Socket Error:', data);
      alert(data.message);
    });
  }

  private startLocalTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.turnRemaining.update(v => v !== null && v > 0 ? v - 1 : 0);
    }, 1000);
  }

  private stopLocalTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.turnRemaining.set(null);
  }

  ngOnDestroy() {
    this.stopLocalTimer();
    this.socketService.offEvent('game_state');
    this.socketService.offEvent('error');
  }

  /** Called before gameState is updated — finds cards that just became visible */
  private triggerFlipsForNewlyRevealedCards(newState: BlackjackGameState): void {
    if (newState.phase === 'BETTING') this.revealedCards.clear();
    // Dealer cards
    newState.bot.cards.forEach((card, i) => {
      const key = `dealer-${i}`;
      if (card.visibility === 'all' && !this.revealedCards.has(key)) {
        this.revealedCards.add(key);
        this.triggerFlip(key);
      }
    });

    // Player cards (all players, for symmetry)
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
    // Remove after animation completes so it can re-trigger if needed
    setTimeout(() => this.flippingCards.delete(key), 520);
  }

  isFlipping(key: string): boolean {
    return this.flippingCards.has(key);
  }

  hit() {
    this.socketService.emitEvent('player_move', { gameId: this.gameId, action: 'hit' });
  }

  stand() {
    this.socketService.emitEvent('player_move', { gameId: this.gameId, action: 'stand' });
  }

  double() {
    this.socketService.emitEvent('player_move', { gameId: this.gameId, action: 'double' });
  }

  placeBet() {
    const amount = this.selectedChip();
    this.socketService.emitEvent('player_move', {
      gameId: this.gameId,
      action: 'bet',
      amount
    });
  }

  selectChip(value: number): void {
    this.selectedChip.set(value);
  }

  get canDouble(): boolean {
    return this.gameState()?.phase === 'PLAYING' &&
      this.gameState()?.currentPlayerId === this.userId &&
      this.me()?.cards?.length === 2;
  }

  get isMyTurn(): boolean {
    return this.gameState()?.currentPlayerId === this.userId;
  }

  getRank(cardName: string): string {
    return getCardRank(cardName);
  }
}