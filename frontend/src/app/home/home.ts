import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
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
  private isBrowser: boolean;

  favorites: { [key: string]: boolean } = {
    'Blackjack': false,
    'PokerTexas': false,
    'Slotmachine': false
  };

  // Map favorite keys to display names and routes
  favoriteGameIds = [
    { key: 'Blackjack', title: 'Blackjack', route: '/blackjack' },
    { key: 'PokerTexas', title: "Poker Texas Hold'em", route: '/poker' },
    { key: 'Slotmachine', title: 'Slotmachine', route: '/slotmachine' }
  ];

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
}
