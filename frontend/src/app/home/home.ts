import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService } from '../services/data-service';
interface ClubMember {
  uuid: string,
  username: string,
  displayname: string,
  status: string
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  showLeaderboard = false;
  private isBrowser: boolean;

  dataService: DataService = inject(DataService);
  clubName: WritableSignal<string> = signal('[name]');
  clubMembers: WritableSignal<ClubMember[]> = signal([]);

  favorites: { [key: string]: boolean } = {
    'Blackjack': false,
    'PokerTexas': false,
    'Slotmachine': false,
    'Roulette': false,
  };

  favoriteGameIds = [
    { key: 'Roulette',    title: 'Roulette',             route: '/roulette'    },
    { key: 'Blackjack',   title: 'Blackjack',            route: '/blackjack'   },
    { key: 'PokerTexas',  title: "Poker Texas Hold'em",  route: '/poker'       },
    { key: 'Slotmachine', title: 'Slotmachine',          route: '/slotmachine' },
  ];

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit(): Promise<void> {
    const res = await fetch(`/clubs/${this.dataService.getUserId()}`, {
      method: 'GET'
    });

    if (res.ok) {
      const club = (await res.json()).club;

      if (club) {
        this.clubName.set(club.name);
        this.clubMembers.set(club.members);
      }
    }
  }

  setSlide(slide: 'friends' | 'leaderboard'): void {
    this.showLeaderboard = slide === 'leaderboard';
  }

  toggleFavorite(game: string, event: Event): void {
    event.stopPropagation();
    this.favorites[game] = !this.favorites[game];
  }

  isFavorite(game: string): boolean {
    return this.favorites[game] ?? false;
  }

  get favoriteGames() {
    return this.favoriteGameIds.filter(game => this.isFavorite(game.key));
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
