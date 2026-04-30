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
    'Slotmachine': false,
    'Blackjack': false,
    'Poker Texas Hold\'em': false,
    'Spiel tmp': false
  };

  setSlide(slide: 'friends' | 'leaderboard'): void {
    this.showLeaderboard = slide === 'leaderboard';
  }

  toggleFavorite(game: string): void {
    this.favorites[game] = !this.favorites[game];
  }

  isFavorite(game: string): boolean {
    return this.favorites[game] || false;
  }
}
