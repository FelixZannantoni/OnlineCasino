import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private socketService: SocketService,
    private dataService: DataService
  ) {
    this.userId = this.dataService.getUserId();
  }

  ngOnInit() {
    if (this.userId) {
      this.socketService.joinGame(this.gameId, this.userId);
    }

    this.socketService.onEvent('game_state', (data: any) => {
      console.log('Blackjack State Update:', data);
      this.gameState.set(data as BlackjackGameState);
    });

    this.socketService.onEvent('error', (data: any) => {
        alert(data.message);
    });
  }

  ngOnDestroy() {
    this.socketService.offEvent('game_state');
    this.socketService.offEvent('error');
  }

  get me(): BlackjackPlayer | undefined {
    return this.gameState()?.players.find(p => p.id === this.userId);
  }

  get isMyTurn(): boolean {
    return this.gameState()?.currentPlayerId === this.userId;
  }

  get canHit(): boolean {
    return this.isMyTurn && this.gameState()?.phase === 'PLAYING';
  }

  get canStand(): boolean {
    return this.isMyTurn && this.gameState()?.phase === 'PLAYING';
  }

  get canDouble(): boolean {
    return this.isMyTurn && this.gameState()?.phase === 'PLAYING' && this.me?.cards.length === 2;
  }

  get isBettingPhase(): boolean {
    return this.gameState()?.phase === 'BETTING';
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

  setDesiredBet(amount: number) {
      this.betAmount = amount;
      this.socketService.emitEvent('set_desired_bet', {
          gameId: this.gameId,
          amount: amount
      });
  }

  getRank(cardName: string): string {
    return getCardRank(cardName);
  }

  getSuitClass(color: string): string {
    return color.toLowerCase();
  }
}
