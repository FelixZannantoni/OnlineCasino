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
      this.gameState.set(state);

      const me = state.players.find(p => p.id === this.userId);
      if (me) {
        if (typeof me.balance === 'number') this.balance = me.balance;
        if (typeof me.bet === 'number') this.pot = me.bet; // Oder Summe aller Bets?
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

  hit() {
    this.socketService.emitEvent('player_move', {
      gameId: this.gameId,
      action: 'hit'
    });
  }

  stand() {
    this.socketService.emitEvent('player_move', {
      gameId: this.gameId,
      action: 'stand'
    });
  }

  double() {
    this.socketService.emitEvent('player_move', {
      gameId: this.gameId,
      action: 'double'
    });
  }

  placeBet() {
    this.socketService.emitEvent('player_move', {
      gameId: this.gameId,
      action: 'bet',
      amount: this.betAmount
    });
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
