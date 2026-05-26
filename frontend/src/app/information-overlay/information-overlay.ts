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
    description: 'Das klassische Kartenspiel, bei dem du so nah wie möglich an 21 Punkte kommen musst, ohne zu überschreiten. Schlage den Dealer und gewinne das Doppelte deines Einsatzes!',
    howToPlay: [
      'Erhalte 2 Karten – der Dealer bekommt ebenfalls 2 Karten (eine verdeckt).',
      'Entscheide: Hit (weitere Karte), Stand (halten), Double (verdoppeln) oder Split (teilen bei Paaren).',
      'Ziel: Näher an 21 kommen als der Dealer, ohne zu überbieten.',
      'Bild- und 10er-Karten zählen 10 Punkte, Asse zählen 1 oder 11.'
    ],
    difficulty: 'Easy',
    minBet: '10 Chips',
    maxBet: '5.000 Chips',
    players: '1–7 Spieler'
  },
  {
    key: 'PokerTexas',
    title: "Poker Texas Hold'em",
    icon: 'casino',
    description: "Die Königsdisziplin der Kartenspiele. Kombiniere deine 2 Handkarten mit 5 Gemeinschaftskarten zu der besten 5-Karten-Hand und überzeuge deine Gegner – oder bluffe dich zum Sieg!",
    howToPlay: [
      'Jeder Spieler erhält 2 verdeckte Handkarten (Hole Cards).',
      '5 Gemeinschaftskarten werden schrittweise aufgedeckt: Flop (3), Turn (1), River (1).',
      'Bilde die beste 5-Karten-Hand aus deinen 2 + den 5 Gemeinschaftskarten.',
      'In jeder Runde: setzen (Bet), erhöhen (Raise), mitgehen (Call) oder aussteigen (Fold).',
      'Der Spieler mit der besten Hand oder der letzte Verbleibende gewinnt den Pot.'
    ],
    difficulty: 'Hard',
    minBet: '10 Chips',
    maxBet: 'Unbegrenzt (All-in)',
    players: '2–9 Spieler'
  },
  {
    key: 'Slotmachine',
    title: 'Slotmachine',
    icon: 'casino',
    badge: 'Bald verfügbar',
    description: 'Drehe die Walzen und hoffe auf das Beste! Kombiniere Symbole auf den Gewinnlinien und kassiere massive Multiplikatoren. Jackpot-Runden und Bonusspiele warten auf dich!',
    howToPlay: [
      'Wähle deinen Einsatz und die Anzahl der aktiven Gewinnlinien.',
      'Drücke Spin und beobachte, wie die Walzen drehen.',
      'Gleiche Symbole auf einer aktiven Gewinnlinie = Gewinn!',
      'Scatter-Symbole aktivieren Bonusrunden, Wild-Symbole ersetzen andere Symbole.',
      'Fünf gleiche Jackpot-Symbole = Hauptgewinn!'
    ],
    difficulty: 'Easy',
    minBet: '10 Chips',
    maxBet: '2.000 Chips',
    players: '1 Spieler'
  },
  {
    key: 'Roulette',
    title: 'Roulette',
    icon: 'radio_button_unchecked',
    badge: 'In Entwicklung',
    description: 'Das Rad der Fortuna! Setze auf Zahlen, Farben oder Zahlengruppen und sieh zu, wie die Kugel ihr Schicksal bestimmt. Mit dem richtigen Tipp kannst du bis zu das 35-fache deines Einsatzes gewinnen!',
    howToPlay: [
      'Platziere Chips auf dem Tisch: auf einzelne Zahlen, Farben (Rot/Schwarz), Gerade/Ungerade oder Gruppen.',
      'Der Croupier dreht das Rad und wirft die Kugel.',
      'Landet die Kugel auf deiner Zahl oder Farbe, gewinnst du!',
      'Einzelne Zahlen zahlen 35:1 – Rot/Schwarz, Gerade/Ungerade zahlen 1:1.',
      'Die Zahl 0 gewinnt nur für die Bank.'
    ],
    difficulty: 'Medium',
    minBet: '10 Chips',
    maxBet: '10.000 Chips',
    players: '1–8 Spieler'
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
