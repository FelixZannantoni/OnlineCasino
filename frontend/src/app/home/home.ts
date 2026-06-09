import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatIconModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  showLeaderboard = false;
  selectingStakesFor: string | null = null;
  private isBrowser: boolean;
  private router = inject(Router);

  favorites: { [key: string]: boolean } = {
    'Blackjack': false,
    'PokerTexas': false,
    'Slotmachine': false
  };

  // Map favorite keys to display names and routes
  favoriteGameIds = [
    { key: 'Roulette', title: 'Roulette', route: '/roulette' },
    { key: 'Blackjack', title: 'Blackjack', route: '/blackjack' },
    { key: 'PokerTexas', title: "Poker Texas Hold'em", route: '/poker' },
    { key: 'Slotmachine', title: 'Slotmachine', route: '/slotmachine' }
  ];

  // Last played game
  lastPlayedGame = { key: 'Blackjack', title: 'Blackjack', route: '/blackjack' };

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  setSlide(slide: 'friends' | 'leaderboard'): void {
    this.showLeaderboard = slide === 'leaderboard';
  }

  toggleFavorite(game: string, event: Event): void {
    event.stopPropagation();
    if (this.favorites[game] !== undefined) {
      this.favorites[game] = !this.favorites[game];
    } else {
      this.favorites[game] = true;
    }
  }

  isFavorite(game: string): boolean {
    return this.favorites[game] || false;
  }

  get favoriteGames() {
    return this.favoriteGameIds.filter(game => this.isFavorite(game.key));
  }

  openInfo(gameKey: string, event: Event): void {
    event.stopPropagation();
    if (!this.isBrowser) return;
    window.dispatchEvent(new CustomEvent('toggleInfoOverlay', {
      detail: { gameKey }
    }));
  }

  onGameClick(gameKey: string, needsStakes: boolean = true): void {
    if (!needsStakes) {
      const game = this.favoriteGameIds.find(g => g.key === gameKey);
      if (game) {
        this.router.navigate([game.route]);
      }
      return;
    }
    this.selectingStakesFor = gameKey;
  }

  selectStakes(stakes: string): void {
    if (!this.selectingStakesFor) return;
    const game = this.favoriteGameIds.find(g => g.key === this.selectingStakesFor);
    if (game) {
      const uniqueGameId = `${game.key.toLowerCase()}-${stakes.toLowerCase()}`;
      this.router.navigate([game.route], { queryParams: { stakes: stakes, gameId: uniqueGameId } });
    }
    this.selectingStakesFor = null;
  }
}
