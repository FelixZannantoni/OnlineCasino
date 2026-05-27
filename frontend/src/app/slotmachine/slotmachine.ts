import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SlotmachineService } from './slotmachine.service';

// SVG symbol definitions

function svgSeven(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <text x="10" y="52" font-family="Georgia,serif" font-size="58" font-weight="900"
      fill="#e02020" stroke="#7a0000" stroke-width="1.5" paint-order="stroke">7</text>
  </svg>`;
}

function svgDiamond(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,6 56,26 32,58 8,26" fill="#60c8ff" stroke="#0080c0" stroke-width="1.5"/>
    <polygon points="32,6 56,26 32,26" fill="rgba(255,255,255,0.35)"/>
    <polygon points="8,26 32,26 32,58" fill="rgba(0,60,120,0.3)"/>
    <polygon points="56,26 32,26 32,58" fill="rgba(0,100,180,0.2)"/>
    <line x1="8" y1="26" x2="56" y2="26" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
  </svg>`;
}

function svgWild(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,4 38,22 57,22 43,34 48,52 32,41 16,52 21,34 7,22 26,22"
      fill="#a855f7" stroke="#6b21a8" stroke-width="1.5"/>
    <text x="32" y="36" text-anchor="middle" font-family="Georgia,serif"
      font-size="11" font-weight="900" fill="#fff" letter-spacing="0.5">WILD</text>
  </svg>`;
}

function svgStar(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,6 38,24 57,24 42,36 48,54 32,43 16,54 22,36 7,24 26,24"
      fill="#ffd700" stroke="#b8860b" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="32,14 36,26 48,26 39,33 42,45 32,38 22,45 25,33 16,26 28,26"
      fill="rgba(255,255,255,0.15)"/>
  </svg>`;
}

function svgBell(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 10 C20 10 14 22 14 34 L14 44 L50 44 L50 34 C50 22 44 10 32 10 Z"
      fill="#ffd700" stroke="#b8860b" stroke-width="1.5"/>
    <rect x="12" y="42" width="40" height="5" rx="2.5" fill="#e0a800" stroke="#b8860b" stroke-width="1"/>
    <circle cx="32" cy="52" r="5" fill="#c89000" stroke="#8b6500" stroke-width="1.2"/>
    <ellipse cx="24" cy="22" rx="5" ry="7" fill="rgba(255,255,255,0.2)" transform="rotate(-15,24,22)"/>
  </svg>`;
}

function svgDoubleBar(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="15" width="52" height="13" rx="3" fill="#c8a000" stroke="#7a5f00" stroke-width="1.2"/>
    <text x="32" y="24" text-anchor="middle" font-family="Georgia,serif"
      font-size="9" font-weight="900" fill="#3a2000" letter-spacing="1">BAR</text>
    <rect x="6" y="33" width="52" height="13" rx="3" fill="#c8a000" stroke="#7a5f00" stroke-width="1.2"/>
    <text x="32" y="43" text-anchor="middle" font-family="Georgia,serif"
      font-size="9" font-weight="900" fill="#3a2000" letter-spacing="1">BAR</text>
  </svg>`;
}

function svgCherry(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 14 Q38 6 48 10 Q44 20 36 20" fill="none" stroke="#2d7a00" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M32 14 Q26 6 18 8 Q20 18 30 20" fill="none" stroke="#2d7a00" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="22" cy="38" r="12" fill="#d40000" stroke="#8b0000" stroke-width="1.5"/>
    <circle cx="42" cy="40" r="11" fill="#d40000" stroke="#8b0000" stroke-width="1.5"/>
    <ellipse cx="19" cy="34" rx="4" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(-20,19,34)"/>
    <ellipse cx="39" cy="36" rx="4" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(-20,39,36)"/>
  </svg>`;
}

function svgBar(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="24" width="52" height="16" rx="4" fill="#c8a000" stroke="#7a5f00" stroke-width="1.5"/>
    <rect x="6" y="31" width="52" height="2" fill="rgba(255,255,255,0.25)"/>
    <text x="32" y="37" text-anchor="middle" font-family="Georgia,serif"
      font-size="11" font-weight="900" fill="#3a2000" letter-spacing="1">BAR</text>
  </svg>`;
}

function svgHorseshoe(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52" fill="none" stroke="#c8a000" stroke-width="8" stroke-linecap="round"/>
    <line x1="10" y1="52" x2="22" y2="52" stroke="#c8a000" stroke-width="6" stroke-linecap="round"/>
    <line x1="42" y1="52" x2="54" y2="52" stroke="#c8a000" stroke-width="6" stroke-linecap="round"/>
    <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52" fill="none" stroke="#ffd700" stroke-width="4" stroke-linecap="round"/>
    <line x1="10" y1="52" x2="22" y2="52" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="42" y1="52" x2="54" y2="52" stroke="#ffd700" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function svgClover(s: number): string {
  return `<svg width="${s}" height="${s}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="20" r="11" fill="#22c55e"/>
    <circle cx="20" cy="34" r="11" fill="#22c55e"/>
    <circle cx="44" cy="34" r="11" fill="#22c55e"/>
    <rect x="28" y="36" width="8" height="16" rx="2" fill="#22c55e"/>
    <ellipse cx="32" cy="50" rx="8" ry="3" fill="#16a34a"/>
    <circle cx="32" cy="20" r="6" fill="#16a34a" opacity="0.3"/>
    <circle cx="20" cy="34" r="6" fill="#16a34a" opacity="0.3"/>
    <circle cx="44" cy="34" r="6" fill="#16a34a" opacity="0.3"/>
  </svg>`;
}

export interface SlotSymbol {
  id: number;
  name: string;
  mult: number;
  svgFn: (size: number) => string;
  svgHtml: SafeHtml;
}

const SYMBOL_DEFS: Record<number, any> = {
  1: { name: 'Bar', svgFn: svgBar, mult: 10 },
  2: { name: 'Cherry', svgFn: svgCherry, mult: 10 },
  3: { name: 'Dbl Bar', svgFn: svgDoubleBar, mult: 20 },
  4: { name: 'Bell', svgFn: svgBell, mult: 20 },
  5: { name: 'Horseshoe', svgFn: svgHorseshoe, mult: 40 },
  6: { name: 'Star', svgFn: svgStar, mult: 40 },
  7: { name: 'Clover', svgFn: svgClover, mult: 100 },
  8: { name: 'Wild', svgFn: svgWild, mult: 100 },
  9: { name: 'Diamond', svgFn: svgDiamond, mult: 500 },
  10: { name: 'Seven', svgFn: svgSeven, mult: 1000 },
};

const REEL_COUNT = 5;

@Component({
  selector: 'app-slotmachine',
  standalone: true,
  imports: [],
  templateUrl: './slotmachine.html',
  styleUrl: './slotmachine.css',
})
export class Slotmachine implements AfterViewInit, OnDestroy {

  @ViewChildren('strip') stripRefs!: QueryList<ElementRef<HTMLElement>>;

  credits = 1000;
  bet = 10;
  spins = 0;
  isWin = false;
  winAmount = 0;
  spinning = false;
  autoSpin = false;
  initializing = true;
  winningLineIndices: number[] = [];

  readonly reels = Array.from({ length: REEL_COUNT }, (_, i) => i);
  readonly symbols: SlotSymbol[];
  readonly paytableSymbols: SlotSymbol[];

  readonly WIN_LINES = [
    [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], // Horizontal Middle (Line 0)
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // Horizontal Top (Line 1)
    [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // Horizontal Bottom (Line 2)
    [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]], // V-Shape (Down-Up) (Line 3)
    [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]], // V-Shape (Up-Down) (Line 4)
    [[1, 0], [2, 1], [2, 2], [2, 3], [1, 4]], // Middle-Bottom-Middle (Line 5)
    [[1, 0], [0, 1], [0, 2], [0, 3], [1, 4]], // Middle-Top-Middle (Line 6)
    [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]], // Bottom-Middle-Top Zigzag (Line 7)
    [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]], // Top-Middle-Bottom Zigzag (Line 8)
    [[2, 0], [1, 1], [1, 2], [1, 3], [0, 4]]  // M-Shape (Line 9)
  ];

  private readonly STRIP_LEN = 30;
  private readonly SYM_H = 120; 
  private readonly BET_STEPS = [10, 25, 50, 100, 250, 500];

  private strips: HTMLElement[] = [];
  private autoSpinTimer: any = null;
  private gameId: string | null = null;

  constructor(private sanitizer: DomSanitizer, private smService: SlotmachineService, private cdr: ChangeDetectorRef) {
    this.symbols = Object.entries(SYMBOL_DEFS).map(([id, d]) => ({
      id: Number(id),
      ...d,
      svgHtml: this.sanitizer.bypassSecurityTrustHtml(d.svgFn(18)),
    }));
    this.paytableSymbols = [...this.symbols].sort((a, b) => b.mult - a.mult);
  }

  async ngAfterViewInit(): Promise<void> {
    this.strips = this.stripRefs.map(r => r.nativeElement);
    this.strips.forEach(el => this.buildStrip(el));
    
    try {
      this.gameId = await this.smService.createGame("user-1", "testuser", "Test User", this.credits);
      this.initializing = false;
      this.cdr.detectChanges();
    } catch (e) {
      console.error("Failed to create game:", e);
      // Even if it fails, allow the UI to stop showing "initializing" state
      this.initializing = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSpin();
  }

  get canSpin(): boolean {
    return !this.spinning && !this.initializing && !!this.gameId;
  }

  async spin(): Promise<void> {
    if (!this.canSpin || !this.gameId) return;

    this.spinning = true;
    this.isWin = false;
    this.winAmount = 0;
    this.spins++;

    try {
      const result = await this.smService.spin(this.gameId, this.bet);
      
      if (!result) {
        throw new Error("Spin result was null");
      }

      const reelResults = this.reels.map(col => [
        result.slots[0][col],
        result.slots[1][col],
        result.slots[2][col]
      ]);

      await Promise.all(
        this.reels.map((_, i) => this.animateReel(i, reelResults[i], i * 120))
      );

      await this.wait(150);

      this.isWin = result.win > 0;
      this.winAmount = result.win;
      this.credits = result.balance;
      this.winningLineIndices = result.winningLines || [];
      
    } catch (e) {
      console.error("Spin failed:", e);
      this.stopAutoSpin();
    } finally {
      this.spinning = false;
      if (this.autoSpin) {
        this.autoSpinTimer = setTimeout(() => this.spin(), 800);
      }
      this.cdr.detectChanges();
    }
  }

  toggleAutoSpin(): void {
    this.autoSpin = !this.autoSpin;
    if (this.autoSpin && this.canSpin) {
      this.spin();
    } else if (!this.autoSpin) {
      this.stopAutoSpin();
    }
  }

  private stopAutoSpin(): void {
    if (this.autoSpinTimer) {
      clearTimeout(this.autoSpinTimer);
      this.autoSpinTimer = null;
    }
    this.autoSpin = false;
  }

  increaseBet(): void {
    const i = this.BET_STEPS.indexOf(this.bet);
    if (i < this.BET_STEPS.length - 1) this.bet = this.BET_STEPS[i + 1];
  }

  decreaseBet(): void {
    const i = this.BET_STEPS.indexOf(this.bet);
    if (i > 0) this.bet = this.BET_STEPS[i - 1];
  }

  setMaxBet(): void {
    this.bet = this.BET_STEPS[this.BET_STEPS.length - 1];
  }

  resetCredits(): void {
    this.stopAutoSpin();
    this.credits = 1000;
    this.spins = 0;
    this.isWin = false;
    this.winAmount = 0;
    this.winningLineIndices = [];
  }

  getWinLinePath(lineIdx: number): string {
    const line = this.WIN_LINES[lineIdx];
    if (!line) return '';
    return line.map((coord, i) => {
      const x = (coord[1] + 0.5) * 20;
      const y = (coord[0] + 0.5) * 120;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  private buildStrip(el: HTMLElement): void {
    el.innerHTML = '';
    for (let i = 0; i < this.STRIP_LEN; i++) {
      el.appendChild(this.makeSymNode(Math.floor(Math.random() * 10) + 1));
    }
    this.snapToCenter(el, 2);
  }

  private makeSymNode(symId: number): HTMLElement {
    const div = document.createElement('div');
    div.className = 'sym';
    const def = SYMBOL_DEFS[symId];
    div.innerHTML = def ? def.svgFn(80) : '';
    return div;
  }

  private snapToCenter(el: HTMLElement, rowIdx: number): void {
    const offset = -(rowIdx - 1) * this.SYM_H;
    el.style.transition = 'none';
    el.style.transform = `translateY(${offset}px)`;
  }

  private setReelSymbols(reelIdx: number, symIds: number[]): void {
    const el = this.strips[reelIdx];
    if (!el || !symIds || symIds.length < 3) return;

    try {
      // Index 1, 2, 3 are the visible ones when translated by -150px
      if (el.children[2]) (el.children[2] as HTMLElement).innerHTML = SYMBOL_DEFS[symIds[0]]?.svgFn(80) || '';
      if (el.children[3]) (el.children[3] as HTMLElement).innerHTML = SYMBOL_DEFS[symIds[1]]?.svgFn(80) || '';
      if (el.children[4]) (el.children[4] as HTMLElement).innerHTML = SYMBOL_DEFS[symIds[2]]?.svgFn(80) || '';
      this.snapToCenter(el, 2);
    } catch (e) {
      console.error("Error setting reel symbols:", e);
    }
  }

  private animateReel(reelIdx: number, finalSyms: number[], delayMs: number): Promise<void> {
    return new Promise(resolve => {
      const el = this.strips[reelIdx];
      if (!el) {
        resolve();
        return;
      }

      const totalFrames = 20 + reelIdx * 5;
      let frame = 0;
      let pos = -(1) * this.SYM_H; // Start at center (row 2)

      const tick = () => {
        if (frame >= totalFrames) {
          this.setReelSymbols(reelIdx, finalSyms);
          resolve();
          return;
        }

        pos -= this.SYM_H;
        // Keep pos within a reasonable range to simulate continuous scrolling
        const minPos = -(this.STRIP_LEN - 4) * this.SYM_H;
        if (pos < minPos) pos = 0;

        el.style.transition = 'none';
        el.style.transform = `translateY(${pos}px)`;
        
        frame++;
        setTimeout(tick, 40 + frame); // Slightly decelerate
      };

      setTimeout(tick, delayMs);
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
