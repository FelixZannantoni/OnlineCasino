import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MODE_CONFIG, type ModeConfig } from '../game-mode-overlay/game-mode-overlay';
import { DataService } from '../services/data-service';

interface ClubMember {
  uuid: string;
  username: string;
  displayname: string;
  status: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  showLeaderboard = false;
  private isBrowser: boolean;
  private readonly router = inject(Router);

  readonly modes = MODE_CONFIG;
  private readonly dataService: DataService = inject(DataService);
  clubName: WritableSignal<string> = signal('[name]');
  clubMembers: WritableSignal<ClubMember[]> = signal([]);

  readonly games = [
    { key: 'Roulette', title: 'Roulette', route: '/roulette' },
    { key: 'Blackjack', title: 'Blackjack', route: '/blackjack' },
    { key: 'PokerTexas', title: 'Poker Texas Hold\'em', route: '/poker' },
    { key: 'Slotmachine', title: 'Slotmachine', route: '/slotmachine' },
  ];

  readonly favoriteCards = new Set<string>();

  private readonly backendGameIds: Record<string, Record<string, number>> = {
    Roulette: { Low: 1, Middle: 2, High: 3 },
    Blackjack: { Low: 4, Middle: 5, High: 6 },
    PokerTexas: { Low: 7, Middle: 8, High: 9 },
    Slotmachine: { Low: 10, Middle: 11, High: 12 },
  };

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getCardId(gameKey: string, modeKey: string): string {
    return `${gameKey}-${modeKey}`;
  }

  get favoriteVariants() {
    return this.games.flatMap((game) =>
      this.modes
        .filter((mode) => this.favoriteCards.has(this.getCardId(game.key, mode.key)))
        .map((mode) => ({ game, mode })),
    );
  }

  iconFor(gameKey: string): string {
    switch (gameKey) {
      case 'Roulette':
        return 'camera';
      case 'Blackjack':
        return 'style';
      case 'PokerTexas':
        return 'games';
      case 'Slotmachine':
        return 'stars';
      default:
        return 'casino';
    }
  }

  launchGame(gameKey: string, mode: ModeConfig): void {
    if (!this.isBrowser) return;

    const routeMap: Record<string, string> = {
      Blackjack: '/blackjack',
      PokerTexas: '/poker',
      Slotmachine: '/slotmachine',
      Roulette: '/roulette',
    };

    const route = routeMap[gameKey];
    if (!route) return;

    this.router.navigate([route], { queryParams: { mode: mode.key.toLowerCase() } });
  }

  async ngOnInit(): Promise<void> {
    console.log("Home Init");
    console.log("UserId:", this.dataService.getUserId());

    await Promise.all([
      this.loadFavoriteGames(),
      this.loadClubInfo(),
    ]);
  }

  setSlide(slide: 'friends' | 'leaderboard'): void {
    this.showLeaderboard = slide === 'leaderboard';
  }

  async toggleFavorite(gameKey: string, modeKey: string, event: Event): Promise<void> {
    event.stopPropagation();

    const cardId = this.getCardId(gameKey, modeKey);
    const shouldFavorite = !this.favoriteCards.has(cardId);

    if (shouldFavorite) {
      this.favoriteCards.add(cardId);
    } else {
      this.favoriteCards.delete(cardId);
    }

    await this.syncFavoriteGames(gameKey, modeKey, shouldFavorite);
  }

  isFavorite(gameKey: string, modeKey: string): boolean {
    return this.favoriteCards.has(this.getCardId(gameKey, modeKey));
  }

  openInfo(gameKey: string, event: Event): void {
    event.stopPropagation();
    if (!this.isBrowser) return;
    window.dispatchEvent(new CustomEvent('toggleInfoOverlay', { detail: { gameKey } }));
  }

  onGameClick(gameKey: string): void {
    if (!this.isBrowser) return;
    window.dispatchEvent(new CustomEvent('toggleGameModeOverlay', { detail: { gameKey } }));
  }

  private async loadClubInfo(): Promise<void> {
    if (!this.isBrowser) return;

    const userId = this.dataService.getUserId();
    if (!userId) return;

    try {
      const res = await fetch(`/clubs/${userId}`, { method: 'GET' });

      if (!res.ok) return;

      const payload = await res.json();
      const club = payload?.club;

      if (club) {
        this.clubName.set(club.name);
        this.clubMembers.set(club.members ?? []);
      }
    } catch (error) {
      console.error('Failed to load club info', error);
    }
  }

  private async loadFavoriteGames(): Promise<void> {
    if (!this.isBrowser) return;

    const userId = this.dataService.getUserId();
    console.log("loadFavoriteGames UserId:", userId);
    if (!userId) {
      this.favoriteCards.clear();
      return;
    }

    try {
      const res = await fetch(`/stats/games/favourite?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;

      const pl = await res.json();

console.log("Payload:", pl);
console.log("gameIds:", pl.gameIds);

      const payload = pl as { gameIds?: Array<number | { gameId?: number }> };
      const favoriteIds = (payload.gameIds ?? [])
        .map((entry) => typeof entry === 'number' ? entry : entry?.gameId)
        .filter((value): value is number => typeof value === 'number');

      this.favoriteCards.clear();

      for (const game of this.games) {
        for (const mode of this.modes) {
          const backendGameId = this.backendGameIds[game.key]?.[mode.key];
          if (backendGameId !== undefined && favoriteIds.includes(backendGameId)) {
            this.favoriteCards.add(this.getCardId(game.key, mode.key));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load favorite games', error);
    }
  }

  private async syncFavoriteGames(gameKey: string, modeKey: string, shouldFavorite: boolean): Promise<void> {
    if (!this.isBrowser) return;

    const userId = this.dataService.getUserId();
    if (!userId) return;

    const gameId = this.backendGameIds[gameKey]?.[modeKey];
    if (gameId === undefined) return;

    try {
      const url = `/stats/games/${gameId}/favourite?userId=${encodeURIComponent(userId)}`;
      const res = shouldFavorite
        ? await fetch(url, { method: 'POST' })
        : await fetch(url, { method: 'DELETE' });

      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to sync favorite state for ${gameKey}/${modeKey}`);
      }
    } catch (error) {
      console.error('Failed to sync favorite games', error);
    }
  }
}
