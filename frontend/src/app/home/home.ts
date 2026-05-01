import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatIconModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  showLeaderboard = false;
  favorites: { [key: string]: boolean } = {
    'Blackjack': false,
    'PokerTexas': false
  };

  // Map favorite keys to display names and routes
  favoriteGameIds = [
    { key: 'Blackjack', title: 'Blackjack', route: '/blackjack' },
    { key: 'PokerTexas', title: 'Poker Texas Hold\'em', route: '/poker' }
  ];

  setSlide(slide: 'friends' | 'leaderboard'): void {
    this.showLeaderboard = slide === 'leaderboard';
  }

  toggleFavorite(game: string, event: Event): void {
    event.stopPropagation();
    if (this.favorites[game] !== undefined) {
      this.favorites[game] = !this.favorites[game];
    } else {
      // Initialize if not exists (for future games like Slotmachine)
      this.favorites[game] = true;
    }
  }

  isFavorite(game: string): boolean {
    return this.favorites[game] || false;
  }

  get favoriteGames() {
    return this.favoriteGameIds.filter(game => this.isFavorite(game.key));
  }
}
