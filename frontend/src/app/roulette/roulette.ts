import { Component, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef, NgZone, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { inject } from '@angular/core';

interface EvenMoneyBet {
  label: string;
  color: 'r' | 'b' | 'g';
  pip?: string;
  sub?: string;
}

interface DozenBet {
  label: string;
}

interface Payout {
  name: string;
  odds: string;
}

interface ChipOption {
  value: number;
  cls: string;
}

@Component({
  selector: 'app-roulette',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './roulette.html',
  styleUrl: './roulette.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Roulette implements AfterViewInit {
  @ViewChild('wheelCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);

  // Signals
  readonly spinning = signal(false);
  readonly resultLabel = signal('');
  readonly resultClass = signal('');
  readonly recentResults = signal<number[]>([32, 15, 0, 7, 26, 3]);

  // Static DATA
  private readonly REDS = new Set([
    1, 3, 5, 7, 9, 11, 13, 15, 17,
    19, 21, 23, 25, 27, 29, 31, 33, 35,
  ]);

  /** Felt grid — 3 rows * 12 columns, displayed top-to-bottom */
  readonly numberLayout: number[][] = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  readonly colLabels = ['3rd Col', '2nd Col', '1st Col'];

  readonly chipOptions: ChipOption[] = [
    { value: 1, cls: 'ch1' },
    { value: 5, cls: 'ch5' },
    { value: 25, cls: 'ch25' },
    { value: 100, cls: 'ch100' },
    { value: 500, cls: 'ch500' },
  ];

  readonly dozens: DozenBet[] = [
    { label: '1st Dozen' },
    { label: '2nd Dozen' },
    { label: '3rd Dozen' },
  ];

  readonly evenMoneyBets: EvenMoneyBet[] = [
    { label: '1-18', color: 'g', sub: '1–18' },
    { label: 'EVEN', color: 'g' },
    { label: 'RED', color: 'r', pip: '♦' },
    { label: 'BLACK', color: 'b', pip: '♠' },
    { label: 'ODD', color: 'g' },
    { label: '19-36', color: 'g', sub: '19–36' },
  ];

  readonly payouts: Payout[] = [
    { name: 'Straight Up', odds: '35:1' },
    { name: 'Split', odds: '17:1' },
    { name: 'Street', odds: '11:1' },
    { name: 'Corner', odds: '8:1' },
    { name: 'Dozen / Column', odds: '2:1' },
    { name: 'Even Money', odds: '1:1' },
  ];

  private ctx!: CanvasRenderingContext2D;
  private wheelAngle = 0;
  private readonly SIZE = 300;
  private readonly CX = 150;
  private readonly CY = 150;
  private readonly R_INNER = 116;
  private readonly R_CONE = 46;
  private readonly R_HUB = 18;

  // Lifecycle
  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.drawWheel(this.wheelAngle);
  }

  // Template Helpers
  isRed(n: number): boolean {
    return this.REDS.has(n);
  }

  // Canvas drawing
  private drawWheel(angle: number): void {
    const ctx = this.ctx;
    const N = 37;
    const slice = (Math.PI * 2) / N;

    ctx.clearRect(0, 0, this.SIZE, this.SIZE);
    ctx.save();
    ctx.translate(this.CX, this.CY);

    // Outer wood base
    ctx.beginPath();
    ctx.arc(0, 0, this.CX, 0, Math.PI * 2);
    ctx.fillStyle = '#2c1200';
    ctx.fill();

    // Pockets
    const pocketSequence = [
      0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
      27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
    ];

    for (let i = 0; i < N; i++) {
      const start = angle + i * slice - slice / 2;
      const end = angle + (i + 1) * slice - slice / 2;
      const mid = angle + i * slice;
      const n = pocketSequence[i];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.R_INNER, start, end);
      ctx.closePath();
      ctx.fillStyle = n === 0 ? '#1a6b35' : this.REDS.has(n) ? '#8b0000' : '#111';
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,168,76,0.3)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Number label
      ctx.save();
      ctx.rotate(mid + Math.PI / 2);
      ctx.translate(0, -(this.R_INNER - 11));
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px Oswald,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), 0, 0);
      ctx.restore();
    }

    // Fret dividers
    for (let i = 0; i < N; i++) {
      const a = angle + i * slice - slice / 2;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(a) * (this.R_INNER - 16),
        Math.sin(a) * (this.R_INNER - 16)
      );
      ctx.lineTo(Math.cos(a) * this.R_INNER, Math.sin(a) * this.R_INNER);
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Ball track ring
    ctx.beginPath();
    ctx.arc(0, 0, this.R_INNER + 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center cone
    const cg = ctx.createRadialGradient(0, 0, 4, 0, 0, this.R_CONE);
    cg.addColorStop(0, '#4a2a08');
    cg.addColorStop(0.6, '#2c1200');
    cg.addColorStop(1, '#1a0b00');
    ctx.beginPath();
    ctx.arc(0, 0, this.R_CONE, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cone studs (rotate slightly with wheel for movement feel)
    for (let i = 0; i < 8; i++) {
      const da = i * (Math.PI / 4) + angle * 0.1;
      ctx.beginPath();
      ctx.arc(
        Math.cos(da) * (this.R_CONE - 9),
        Math.sin(da) * (this.R_CONE - 9),
        2.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#c9a84c';
      ctx.fill();
    }

    // Hub
    ctx.beginPath();
    ctx.arc(0, 0, this.R_HUB, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0b00';
    ctx.fill();
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hub centre dot
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a84c';
    ctx.fill();

    ctx.restore();
  }
}
