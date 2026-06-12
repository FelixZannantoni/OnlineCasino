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
  minBetValue: number;
  maxBetValue: number;
  color: string;
  blackjackId: string;
  pokerId: string;
  rouletteId: string;
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
    minBetValue: 10,
    maxBetValue: 500,
    color: '#4caf50',
    blackjackId: '2',
    pokerId: '1',
    rouletteId: '3',
  },
  {
    key: 'Middle',
    label: 'Middle',
    icon: 'trending_up',
    tagline: 'Balanced',
    description: 'Balanced risk for experienced players who like it exciting.',
    minBet: '100 Chips',
    maxBet: '2500 Chips',
    minBetValue: 100,
    maxBetValue: 2500,
    color: '#ff9800',
    blackjackId: '8',
    pokerId: '6',
    rouletteId: '5',
  },
  {
    key: 'High',
    label: 'High',
    icon: 'local_fire_department',
    tagline: 'High Stakes',
    description: 'All or nothing – only for hard-core risk-takers.',
    minBet: '500 Chips',
    maxBet: '10000 Chips',
    minBetValue: 500,
    maxBetValue: 10000,
    color: '#f44336',
    blackjackId: '4',
    pokerId: '7',
    rouletteId: '9',
  },
];

/** Resolve numeric min/max from a raw mode query param (case-insensitive). */
export function getBetLimits(modeParam: string | null): { minBet: number; maxBet: number } {
  const key = (modeParam ?? '').toLowerCase();
  const cfg =
    MODE_CONFIG.find(m => m.key.toLowerCase() === key) ?? MODE_CONFIG[0];
  return { minBet: cfg.minBetValue, maxBet: cfg.maxBetValue };
}

/** Get the ModeConfig for a given mode string */
export function getModeConfigByMode(modeParam: string | null): ModeConfig {
    const key = (modeParam ?? '').toLowerCase();
    return MODE_CONFIG.find(m => m.key.toLowerCase() === key) ?? MODE_CONFIG[0];
}

/** Chip denominations filtered to fit inside [minBet, maxBet]. */
export function getChipOptions(minBet: number, maxBet: number): { value: number; cls: string }[] {
  const ALL_CHIPS: { value: number; cls: string }[] = [
    { value: 1,    cls: 'ch1'    },
    { value: 5,    cls: 'ch5'    },
    { value: 10,   cls: 'ch10'   },
    { value: 25,   cls: 'ch25'   },
    { value: 50,   cls: 'ch50'   },
    { value: 100,  cls: 'ch100'  },
    { value: 250,  cls: 'ch250'  },
    { value: 500,  cls: 'ch500'  },
    { value: 1000, cls: 'ch1000' },
    { value: 2500, cls: 'ch2500' },
    { value: 5000, cls: 'ch5000' },
  ];
  const filtered = ALL_CHIPS.filter(c => c.value >= minBet && c.value <= maxBet);
  // Always keep at least the lowest chip that fits under maxBet
  if (filtered.length === 0) {
    const fallback = ALL_CHIPS.filter(c => c.value <= maxBet);
    return fallback.slice(-3);
  }
  return filtered;
}

/** Bet step array for games that use discrete steps (slotmachine). */
export function getBetSteps(minBet: number, maxBet: number): number[] {
  const ALL_STEPS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
  const steps = ALL_STEPS.filter(s => s >= minBet && s <= maxBet);
  return steps.length > 0 ? steps : [minBet];
}

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
