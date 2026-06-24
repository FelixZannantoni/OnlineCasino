import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MODE_CONFIG, type ModeConfig } from '../game-mode-overlay/game-mode-overlay';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  showLeaderboard = false;
  private isBrowser: boolean;
  private readonly router = inject(Router);

  readonly modes = MODE_CONFIG;

  readonly games = [
    { key: 'Roulette',    title: 'Roulette',             route: '/roulette'    },
    { key: 'Blackjack',   title: 'Blackjack',            route: '/blackjack'   },
    { key: 'PokerTexas',  title: "Poker Texas Hold'em",  route: '/poker'       },
    { key: 'Slotmachine', title: 'Slotmachine',          route: '/slotmachine' },
  ];

  readonly favoriteCards = new Set<string>();

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getCardId(gameKey: string, modeKey: string): string {
    return `${gameKey}-${modeKey}`;
  }

  get favoriteVariants() {
    return this.games.flatMap(game =>
      this.modes
        .filter(mode => this.favoriteCards.has(this.getCardId(game.key, mode.key)))
        .map(mode => ({ game, mode }))
    );
  }

  get gameVariants() {
    return this.games.flatMap(game =>
      this.modes.map(mode => ({ game, mode }))
    );
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

  setSlide(slide: 'friends' | 'leaderboard'): void {
    this.showLeaderboard = slide === 'leaderboard';
  }

  toggleFavorite(gameKey: string, modeKey: string, event: Event): void {
    event.stopPropagation();
    const id = this.getCardId(gameKey, modeKey);
    if (this.favoriteCards.has(id)) {
      this.favoriteCards.delete(id);
    } else {
      this.favoriteCards.add(id);
    }
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
}
