import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';

export type GameMode = 'Low' | 'Middle' | 'High';

export interface ModeConfig {
  key: GameMode;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  minBet: string;
  maxBet: string;
  color: string;
}

export const MODE_CONFIG: ModeConfig[] = [
  {
    key: 'Low',
    label: 'Low',
    icon: 'sentiment_satisfied',
    tagline: 'Chill & Casual',
    description: 'Small bets, relaxed play – perfect for warming up.',
    minBet: '10 Chips',
    maxBet: '500 Chips',
    color: '#4caf50',
  },
  {
    key: 'Middle',
    label: 'Middle',
    icon: 'trending_up',
    tagline: 'Balanced',
    description: 'Balanced risk for experienced players who like it exciting.',
    minBet: '100 Chips',
    maxBet: '2.500 Chips',
    color: '#ff9800',
  },
  {
    key: 'High',
    label: 'High',
    icon: 'local_fire_department',
    tagline: 'High Stakes',
    description: 'All or nothing – only for hard-core risk-takers.',
    minBet: '500 Chips',
    maxBet: '10.000 Chips',
    color: '#f44336',
  },
];

@Component({
  selector: 'app-game-mode-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './game-mode-overlay.html',
  styleUrl: './game-mode-overlay.css',
})
export class GameModeOverlay implements OnInit, OnDestroy {
  isOpen = false;
  selectedMode: GameMode | null = null;
  gameKey: string | null = null;

  readonly modes = MODE_CONFIG;

  private toggleSubscription?: Subscription;
  private keydownSubscription?: Subscription;
  private closeSubscription?: Subscription;
  private isBrowser: boolean;
  private ignoreNextClose = false;

  constructor(private router: Router) {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.toggleSubscription = fromEvent<CustomEvent<{ gameKey: string }>>(window, 'toggleGameModeOverlay')
      .subscribe((event) => {
        this.gameKey = event.detail?.gameKey ?? null;
        this.selectedMode = null;
        this.ignoreNextClose = true;
        window.dispatchEvent(new CustomEvent('closeOtherOverlays'));
        this.ignoreNextClose = false;
        this.isOpen = true;
        this.updateBodyScroll();
      });

    this.closeSubscription = fromEvent(window, 'closeOtherOverlays').subscribe(() => {
      if (this.isOpen && !this.ignoreNextClose) this.close();
    });

    this.keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown')
      .subscribe((event) => {
        if (event.key === 'Escape' && this.isOpen) {
          //event.preventDefault();
          console.log("escape pressed");
          this.close();
        }
      });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.toggleSubscription?.unsubscribe();
    this.keydownSubscription?.unsubscribe();
    this.closeSubscription?.unsubscribe();
  }

  close(): void {
    console.log('runnign close()');
    this.isOpen = false;
    this.selectedMode = null;
    this.gameKey = null;
    this.updateBodyScroll();
  }

  chooseMode(mode: GameMode): void {
    this.selectedMode = mode;
  }

  confirmMode(): void {
    if (!this.selectedMode) return;
    this.startGame(this.selectedMode);
  }

  getModeConfig(key: GameMode): ModeConfig {
    return MODE_CONFIG.find(m => m.key === key)!;
  }

  private startGame(mode: GameMode): void {
    if (!this.gameKey) return;

    const routeMap: Record<string, string> = {
      Blackjack: '/blackjack',
      PokerTexas: '/poker',
      Slotmachine: '/slotmachine',
      Roulette: '/roulette',
    };

    const route = routeMap[this.gameKey];
    if (!route) return;

    this.close();
    this.router.navigate([route], { queryParams: { mode: mode.toLowerCase() } });
  }

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}
