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
  folded: boolean;
  balance: number;
  cards: PokerBoardCard[];
};

type PokerGameState = {
  gameId: string;
  phase: string;
  pot: number;
  currentBet: number;
  players: PokerPlayerState[];
  board: PokerBoardCard[];
  currentPlayerId: string | null;
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

  private readonly gameId = signal<string>('1');

  protected readonly getCardRank = getCardRank;

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

    this.socketService.onEvent('game_state', (state: unknown) => {
      const s = state as PokerGameState;
      this.gameState.set(s);

      // Keep table-game bindings in sync with backend state
      if (typeof s?.pot === 'number') this.pot = s.pot;
      if (Array.isArray(s?.players)) {
        const me = s.players.find((p) => p.id === userId);
        if (me && typeof me.balance === 'number') this.balance = me.balance;
      }
    });

    this.socketService.joinGame(id, userId);
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

    const userId = this.dataService.userId(); // for debug/logging only; socket uses socketUserMap
    void userId;

    this.socketService.emitEvent('player_move', {
      gameId: gid,
      action,
      amount,
    });
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

    return me.bet === state.currentBet ? 'Check' : 'Call';
  }

  makeBetOrRaise(): void {
    const state = this.gameState();
    if (!state) return;

    const amount = 20; // from old template
    if (state.currentBet === 0) {
      this.makeMove('bet', amount);
    } else {
      this.makeMove('raise', amount);
    }
  }

  betOrRaiseLabel(): string {
    const state = this.gameState();
    if (!state) return 'Bet';
    return state.currentBet === 0 ? 'Bet 20' : 'Raise';
  }
}
