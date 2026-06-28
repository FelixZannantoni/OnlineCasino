import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MODE_CONFIG, type ModeConfig } from '../game-mode-overlay/game-mode-overlay';
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
  private readonly router = inject(Router);

  readonly modes = MODE_CONFIG;
  dataService: DataService = inject(DataService);
  clubName: WritableSignal<string> = signal('[name]');
  clubMembers: WritableSignal<ClubMember[]> = signal([]);

  favorites: { [key: string]: boolean } = {
    'Blackjack': false,
    'PokerTexas': false,
    'Slotmachine': false,
    'Roulette': false,
  };

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
    if (!this.isBrowser) return;
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
