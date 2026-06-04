import { Component, OnInit, OnDestroy, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TableGameComponent } from '../table-game';
import { SocketService } from '../../services/socket.service';
import { DataService } from '../../services/data-service';
import { BlackjackGameState, BlackjackPlayer } from '../../models/blackjack.models';
import { getCardRank } from '../../services/card-utils';
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
  gameId: string = '2';
  betAmount: number = 10;
  balance: number = 1000;
  pot: number = 0;
  private isBrowser: boolean;

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.userId = this.dataService.getUserId();
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    if (this.userId) {
      this.socketService.joinGame(this.gameId, this.userId);
    }

    this.socketService.onEvent('game_state', (data: any) => {
      console.log('Blackjack State Update:', data);
      const state = data as BlackjackGameState;
      this.triggerFlipsForNewlyRevealedCards(state);
      this.gameState.set(state);

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

  ngOnDestroy() {
    if (!this.isBrowser) return;
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
    this.socketService.emitEvent('player_move', { gameId: this.gameId, action: 'bet', amount: this.betAmount });
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
