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
export class RouletteComponent implements AfterViewInit {
  @ViewChild('wheelCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);

  // Signals
  readonly spinning = signal(false);
  readonly resultLabel = signal('');
  readonly resultClass = signal('');
  readonly recentResults = signal<number[]>([32, 15, 0, 7, 26, 3]);

  // Static DATA
  private readonly REDS = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36,
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

  
}
