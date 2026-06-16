import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';

export interface GameInfo {
  key: string;
  title: string;
  icon: string;
  badge?: string;
  description: string;
  howToPlay: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  minBet: string;
  maxBet: string;
  players: string;
}

export const GAME_INFO: GameInfo[] = [
  {
    key: 'Blackjack',
    title: 'Blackjack',
    icon: 'style',
    badge: 'Multiplayer',
    description: 'The classic card game where you must get as close as possible to 21 without going over. Beat the dealer and win double your bet!',
    howToPlay: [
      'Receive 2 cards — the dealer also gets 2 cards (one of them face down).',
      'Decide: Hit (take another card), Stand (stop), Double (double down), or Split (split pairs).',
      'Goal: Get closer to 21 than the dealer without exceeding it.',
      'Face cards and 10s are worth 10 points; aces are 1 or 11.'
    ],
    difficulty: 'Medium',
    minBet: '10 Chips',
    maxBet: '5.000 Chips',
    players: '1–7 players'
  },
  {
    key: 'PokerTexas',
    title: "Poker Texas Hold'em",
    icon: 'casino',
    badge: 'Multiplayer',
    description: "The king of card games. Combine your 2 hole cards with 5 community cards to make the best 5-card hand and outplay your opponents — or bluff your way to victory!",
    howToPlay: [
      'Each player receives 2 hole cards (face down).',
      '5 community cards are revealed in stages: Flop (3), Turn (1), River (1).',
      'Make the best 5-card hand using your 2 + the 5 community cards.',
      'In every round: Bet, Raise, Call, or Fold.',
      'The player with the best hand — or the last remaining player — wins the pot.'
    ],
    difficulty: 'Hard',
    minBet: '10 Chips',
    maxBet: 'Unlimited (All-in)',
    players: '2–9 players'
  },
  {
    key: 'Slotmachine',
    title: 'Slotmachine',
    icon: 'casino',
    badge: 'Single-player',
    description: 'Spin the reels and hope for the best! Combine symbols on winning lines and cash in big multipliers. Jackpot rounds and bonus games are waiting for you!',
    howToPlay: [
      'Choose your bet and the number of active winning lines.',
      'Press Spin and watch the reels turn.',
      'Matching symbols on an active winning line = win!',
      'Scatter symbols trigger bonus rounds, Wild symbols replace other symbols.',
      'Five matching jackpot symbols = the main prize!'
    ],
    difficulty: 'Easy',
    minBet: '10 Chips',
    maxBet: '2.000 Chips',
    players: '1 player'
  },
  {
    key: 'Roulette',
    title: 'Roulette',
    icon: 'camera',
    badge: 'Single-player',
    description: 'The wheel of fortune! Bet on numbers, colors, or number groups and watch as the ball decides your fate. With the right bet, you can win up to 35 times your stake!',
    howToPlay: [
      'Place chips on the table: on individual numbers, colors (Red/Black), even/odd, or groups.',
      'The croupier spins the wheel and tosses the ball.',
      'If the ball lands on your number or color, you win!',
      'Single numbers pay 35:1 — red/black and even/odd pay 1:1.',
      'The number 0 wins only for the house.'
    ],
    difficulty: 'Easy',
    minBet: '10 Chips',
    maxBet: '10.000 Chips',
    players: '1 player'
  }
];

@Component({
  selector: 'app-information-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './information-overlay.html',
  styleUrl: './information-overlay.css',
})
export class InformationOverlay implements OnInit, OnDestroy {
  isOpen = false;
  currentGame: GameInfo | null = null;

  private toggleSubscription?: Subscription;
  private keydownSubscription?: Subscription;
  private isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.toggleSubscription = fromEvent<CustomEvent>(window, 'toggleInfoOverlay')
      .subscribe((event) => {
        const gameKey = event.detail?.gameKey;
        const game = GAME_INFO.find(g => g.key === gameKey) ?? null;
        this.currentGame = game;
        window.dispatchEvent(new CustomEvent('closeOtherOverlays'));
        this.isOpen = true;
        this.updateBodyScroll();
      });

    fromEvent(window, 'closeOtherOverlays').subscribe(() => {
      if (this.isOpen) this.close();
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
  }

  close(): void {
    this.isOpen = false;
    this.updateBodyScroll();
  }

  getDifficultyColor(diff: string): string {
    if (diff === 'Easy') return '#4caf50';
    if (diff === 'Medium') return '#ff9800';
    return '#f44336';
  }

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}
