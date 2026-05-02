import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// SVG Symbols copied

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

// Types

export interface SlotSymbol {
  name: string;
  mult: number;
  weight: number;
  svgFn: (size: number) => string;
  svgHtml: SafeHtml;   // sanitized, used in template
}

const SYMBOL_DEFS = [
  { name: 'Seven',    svgFn: svgSeven,      mult: 50, weight: 2  },
  { name: 'Diamond',  svgFn: svgDiamond,    mult: 30, weight: 4  },
  { name: 'Wild',     svgFn: svgWild,       mult: 20, weight: 5  },
  { name: 'Star',     svgFn: svgStar,       mult: 15, weight: 7  },
  { name: 'Bell',     svgFn: svgBell,       mult: 10, weight: 10 },
  { name: 'Dbl Bar',  svgFn: svgDoubleBar,  mult: 7,  weight: 12 },
  { name: 'Cherry',   svgFn: svgCherry,     mult: 5,  weight: 14 },
  { name: 'Bar',      svgFn: svgBar,        mult: 3,  weight: 18 },
];

@Component({
  selector: 'app-slotmachine',
  standalone: true,
  imports: [],
  templateUrl: './slotmachine.html',
  styleUrl: './slotmachine.css',
})
export class Slotmachine implements AfterViewInit, OnDestroy {

  // ── UI state (no game logic — wire these up from a service) ──
  credits = 1_000;
  bet     = 10;
  spins   = 0;
  isWin   = false;
  spinning = false;

  // Three reel placeholders — drives @for in template
  readonly reels = [0, 1, 2];

  // Symbols with sanitized SVG ready for [innerHTML]
  readonly symbols: SlotSymbol[];
  readonly paytableSymbols: SlotSymbol[];

  // ── Private reel state ──
  private readonly STRIP_LEN = 28;
  private readonly SYM_H     = 120; // px — keep in sync with CSS .sym height

  private readonly BET_STEPS = [10, 25, 50, 100, 250, 500];
  private stripEls: HTMLElement[] = [];

  constructor(private sanitizer: DomSanitizer) {
    this.symbols = SYMBOL_DEFS.map(d => ({
      ...d,
      svgHtml: this.sanitizer.bypassSecurityTrustHtml(d.svgFn(18)),
    }));
    this.paytableSymbols = [...this.symbols].sort((a, b) => b.mult - a.mult);
  }

  ngAfterViewInit(): void {
    // Grab the three strip elements rendered by @for
    this.stripEls = this.reels.map(i =>
      document.getElementById('strip-' + i) as HTMLElement
    );
    // Build initial random strips
    this.stripEls.forEach((el, i) => {
      this.buildStrip(el);
      const mid = Math.floor(this.STRIP_LEN / 2);
      el.style.transform = `translateY(${-mid * this.SYM_H}px)`;
    });
  }

  ngOnDestroy(): void { /* cancel any pending timeouts if needed */ }

  // Rolls all three reels to a random result and plays the scroll animation.
  async spin(): Promise<void> {
    if (this.spinning) return;

    this.spinning = true;
    this.isWin    = false;
    this.spins++;

    // Pick a random result symbol index for each reel
    const results = this.reels.map(() => this.randomSymbolIndex());

    // Animate all reels concurrently; each stops a little later than the previous
    await Promise.all(
      this.reels.map((_, i) => this.animateReel(i, results[i], i * 380))
    );

    await this.delay(200);

    // Show win state if all three match (purely visual — no credit logic)
    this.isWin   = results[0] === results[1] && results[1] === results[2];
    this.spinning = false;
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
    this.credits = 1_000;
    this.spins   = 0;
    this.isWin   = false;
  }

  // Private helpers 

  // Weighted random — higher-weight symbols appear more often.
  private randomSymbolIndex(): number {
    const total = this.symbols.reduce((sum, s) => sum + s.weight, 0);
    let r = Math.random() * total;
    for (let i = 0; i < this.symbols.length; i++) {
      r -= this.symbols[i].weight;
      if (r <= 0) return i;
    }
    return this.symbols.length - 1;
  }

  // Fills a strip element with STRIP_LEN randomly chosen symbol nodes.
  private buildStrip(el: HTMLElement): void {
    el.innerHTML = '';
    for (let i = 0; i < this.STRIP_LEN; i++) {
      el.appendChild(this.makeSymNode(this.randomSymbolIndex()));
    }
  }

  private makeSymNode(symIdx: number): HTMLElement {
    const div = document.createElement('div');
    div.className = 'sym';
    div.innerHTML = this.symbols[symIdx].svgFn(68);
    return div;
  }

  private setCenterSymbol(reelIdx: number, symIdx: number): void {
    const el  = this.stripEls[reelIdx];
    const mid = Math.floor(this.STRIP_LEN / 2);
    (el.children[mid] as HTMLElement).innerHTML = this.symbols[symIdx].svgFn(68);
    el.style.transition = 'none';
    el.style.transform  = `translateY(${-mid * this.SYM_H}px)`;
  }

  private animateReel(reelIdx: number, finalSym: number, delay: number): Promise<void> {
    return new Promise(resolve => {
      const el          = this.stripEls[reelIdx];
      const totalFrames = 20 + reelIdx * 9;
      let   frame       = 0;
      let   pos         = -Math.floor(this.STRIP_LEN / 2) * this.SYM_H;

      const tick = () => {
        if (frame >= totalFrames) {
          this.setCenterSymbol(reelIdx, finalSym);
          resolve();
          return;
        }
        pos -= this.SYM_H;
        if (pos < -(this.STRIP_LEN - 1) * this.SYM_H) pos = 0;
        el.style.transition = 'none';
        el.style.transform  = `translateY(${pos}px)`;
        frame++;
        setTimeout(tick, 55);
      };

      setTimeout(tick, delay);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}