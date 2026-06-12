import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
  inject,
  signal,
  computed,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { DataService } from '../services/data-service';

interface Bet {
  label: string;
  odds: number;
  amount: number;
}

interface ChipOption {
  value: number;
  cls: string;
}

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

@Component({
  selector: 'app-roulette',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './roulette.html',
  styleUrl: './roulette.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class Roulette implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wheelCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);
  private readonly socketService = inject(SocketService);
  private readonly dataService = inject(DataService);
  private readonly route = inject(ActivatedRoute);
  private isBrowser: boolean;

  //
  readonly balance = signal(0);
  readonly selectedChip = signal(1);
  readonly bets = signal<Bet[]>([]); //TODO: Add max and min bet from game-moder-overlay
  readonly players = signal<any[]>([]);
  readonly spinning = signal(false);
  readonly isReady = signal(false);
  readonly remainingTime = signal(0);
  readonly resultLabel = signal('');
  readonly resultClass = signal('');
  readonly recentResults = signal<number[]>([]);
  readonly gameId = '3'; // Assuming Roulette game ID is 3
  private userId: string | null = null;
  private currentPhase: string = 'WAITING';

  //
  readonly totalWagered = computed(() =>
    this.bets().reduce((sum, b) => sum + b.amount, 0)
  );

  //
  private readonly REDS = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  /** Authentic European pocket sequence */
  private readonly SEQUENCE = [
    0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
    27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
  ];

  /** Felt grid — 3 rows × 12 columns, displayed top-to-bottom */
  readonly numberLayout: number[][] = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  readonly colLabels = ['3rd Col', '2nd Col', '1st Col'];

  readonly chipOptions = signal<ChipOption[]>([
    { value: 1, cls: 'ch1' },
    { value: 5, cls: 'ch5' },
    { value: 25, cls: 'ch25' },
    { value: 100, cls: 'ch100' },
    { value: 500, cls: 'ch500' },
  ]);

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

  //
  private ctx!: CanvasRenderingContext2D;
  private wheelAngle = 0;
  private readonly SIZE = 300;
  private readonly CX = 150;
  private readonly CY = 150;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.userId = this.dataService.getUserId();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const stakes = this.route.snapshot.queryParamMap.get('stakes') || undefined;

    if (this.userId) {
      // Allow time for the socket to connect before joining
      this.socketService.joinGame(this.gameId, this.userId, stakes);
    }

    this.socketService.onEvent('game_state', (data: any) => {
      this.handleGameState(data);
    });

    this.socketService.onEvent('error', (data: any) => {
      console.error('Socket Error:', data);
      alert(data.message);
    });
  }

  private handleGameState(state: any): void {
    console.log('Roulette State Update:', state);
    if (state.chipOptions) {
      this.chipOptions.set(state.chipOptions);
    }
    this.players.set(state.players);
    const me = state.players.find((p: any) => p.id === this.userId);
    if (me) {
      this.balance.set(me.balance);
      this.bets.set(me.bets.map((b: any) => ({
        label: b.field,
        amount: b.amount,
        odds: 0 // Odds are handled by backend
      })));
      this.isReady.set(me.isReady);
    }
    this.remainingTime.set(state.remainingTime);

    if (state.phase === 'SPINNING' && this.currentPhase !== 'SPINNING' && state.lastWinningNumber !== null) {
      this.animateSpin(state.lastWinningNumber);
    }

    if (state.phase === 'FINISHED' && this.currentPhase === 'SPINNING') {
      // Just ensure spinning signal is false if it wasn't already
      this.spinning.set(false);
    }

    this.currentPhase = state.phase;
  }

  //
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    // Defer past the first paint so the canvas is fully laid out in the DOM
    setTimeout(() => {
      this.drawWheel(this.wheelAngle);
      this.startIdleLoop();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.socketService.offEvent('game_state');
      this.socketService.offEvent('error');
      if (this.idleRafId !== null) {
        cancelAnimationFrame(this.idleRafId);
      }
    }
  }

  // Idle loop keeps the canvas redrawn at rest so OnPush / zone cycles
  // never blank it out between spins
  private idleRafId: number | null = null;

  private startIdleLoop(): void {
    if (!this.isBrowser) return;

    const loop = () => {
      if (!this.spinning()) {
        this.drawWheel(this.wheelAngle);
      }
      this.idleRafId = requestAnimationFrame(loop);
    };
    this.idleRafId = requestAnimationFrame(loop);
  }

  //
  isRed(n: number): boolean {
    return this.REDS.has(n);
  }

  getBetOn(label: string): number | null {
    return this.bets().find(b => b.label === label)?.amount ?? null;
  }

  //
  selectChip(value: number): void {
    this.selectedChip.set(value);
  }

  placeBet(label: string, odds: number): void {
    if (this.currentPhase !== 'BETTING' || this.spinning() || this.isReady()) return;
    const chip = this.selectedChip();
    if (chip > this.balance()) return;

    this.socketService.emitEvent('player_move', {
      gameId: this.gameId,
      action: 'bet',
      amount: chip,
      field: label
    });
  }

  undoLast(): void {
    // Backend doesn't support undo yet
  }

  clearBets(): void {
    if (this.isReady()) return;
    // Backend doesn't support clear yet
  }

  //
  ready(): void {
    if (this.currentPhase !== 'BETTING' || this.spinning() || !this.bets().length) return;

    // Toggle ready state
    const newReadyStatus = !this.isReady();
    this.socketService.emitEvent('player_move', {
      gameId: this.gameId,
      action: 'ready',
      amount: newReadyStatus ? 1 : 0 // Using amount as a flag for ready/unready
    });
  }

  private animateSpin(result: number): void {
    if (!this.isBrowser) return;
    if (this.spinning()) return;
    this.spinning.set(true);
    this.resultLabel.set('');
    this.resultClass.set('');

    // Stop the idle loop — the spin animation takes over drawing
    if (this.idleRafId !== null) {
      cancelAnimationFrame(this.idleRafId);
      this.idleRafId = null;
    }

    const N = this.SEQUENCE.length;
    const slice = (Math.PI * 2) / N;
    const landingIndex = this.SEQUENCE.indexOf(result);

    const pocketAngle = landingIndex * slice;
    const needed =
      ((-Math.PI / 2 - pocketAngle) % (Math.PI * 2) + Math.PI * 2) %
      (Math.PI * 2);
    const extra = Math.PI * 2 * (6 + Math.random() * 4);

    const startAngle = this.wheelAngle;
    const currentNorm = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const targetAngle = startAngle + extra + needed - currentNorm;

    const duration = 4000 + Math.random() * 1000;
    const startTime = performance.now();

    this.zone.runOutsideAngular(() => {
      const animate = (ts: number) => {
        const t = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        const cur = startAngle + (targetAngle - startAngle) * eased;
        this.drawWheel(cur);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          this.wheelAngle = targetAngle % (Math.PI * 2);
          this.zone.run(() => this.onSpinComplete(result));
        }
      };
      requestAnimationFrame(animate);
    });
  }

  private onSpinComplete(result: number): void {
    this.spinning.set(false);
    this.recentResults.update(prev => [result, ...prev.slice(0, 11)]);
    // Bets are cleared by the backend at start of next round

    if (result === 0) {
      this.resultLabel.set('0 — Green');
      this.resultClass.set('green');
    } else if (this.isRed(result)) {
      this.resultLabel.set(`${result} — Red`);
      this.resultClass.set('red');
    } else {
      this.resultLabel.set(`${result} — Black`);
      this.resultClass.set('black');
    }

    // Resume idle drawing loop now that the spin animation has ended
    this.startIdleLoop();
  }

  //
  //
  //  Radii (px, canvas 300×300, centre 150,150):
  //    150  outer wood rim edge
  //    142  gold border ring outer
  //    134  number segment outer edge   ← numbers live here
  //     96  number segment inner edge / ball-track outer
  //     88  ball-track inner / inner bowl outer
  //     52  decorative cone outer
  //     18  hub
  //
  private drawWheel(angle: number): void {
    if (!this.isBrowser) return;
    const ctx = this.ctx;
    const N = this.SEQUENCE.length;
    const slice = (Math.PI * 2) / N;

    // Layer radii
    const R_RIM = 148;  // outer mahogany rim
    const R_BORDER_OUT = 141;  // gold ring outer
    const R_BORDER_IN = 137;  // gold ring inner
    const R_SEG_OUT = 136;  // coloured number segments outer
    const R_SEG_IN = 94;  // coloured number segments inner
    const R_TRACK_OUT = 93;  // ball track outer
    const R_TRACK_IN = 83;  // ball track inner
    const R_BOWL = 82;  // inner dark bowl
    const R_CONE = 50;  // decorative centre cone
    const R_HUB = 18;  // hub knob

    ctx.clearRect(0, 0, this.SIZE, this.SIZE);
    ctx.save();
    ctx.translate(this.CX, this.CY);

    //
    ctx.beginPath();
    ctx.arc(0, 0, R_RIM, 0, Math.PI * 2);
    const woodGrad = ctx.createRadialGradient(0, 0, R_RIM * 0.5, 0, 0, R_RIM);
    woodGrad.addColorStop(0, '#5a2a0a');
    woodGrad.addColorStop(0.6, '#3a1606');
    woodGrad.addColorStop(1, '#1a0b00');
    ctx.fillStyle = woodGrad;
    ctx.fill();

    //
    ctx.beginPath();
    ctx.arc(0, 0, R_BORDER_OUT, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a84c';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, R_BORDER_IN, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0b00';
    ctx.fill();

    //
    for (let i = 0; i < N; i++) {
      const start = angle + i * slice - slice / 2;
      const end = angle + (i + 1) * slice - slice / 2;
      const n = this.SEQUENCE[i];

      // Segment fill (annular wedge)
      ctx.beginPath();
      ctx.arc(0, 0, R_SEG_OUT, start, end);
      ctx.arc(0, 0, R_SEG_IN, end, start, true);
      ctx.closePath();
      ctx.fillStyle = n === 0 ? '#1a6b35' : this.REDS.has(n) ? '#8b0000' : '#1a1a1a';
      ctx.fill();

      // Gold divider line between segments
      ctx.beginPath();
      ctx.moveTo(Math.cos(start) * R_SEG_IN, Math.sin(start) * R_SEG_IN);
      ctx.lineTo(Math.cos(start) * R_SEG_OUT, Math.sin(start) * R_SEG_OUT);
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    //
    const R_NUM = (R_SEG_OUT + R_SEG_IN) / 2; // mid-point of segment band
    for (let i = 0; i < N; i++) {
      const mid = angle + i * slice;
      const n = this.SEQUENCE[i];

      ctx.save();
      ctx.rotate(mid);
      ctx.translate(R_NUM, 0);
      ctx.rotate(Math.PI / 2); // upright relative to rim
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Oswald,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), 0, 0);
      ctx.restore();
    }

    //
    ctx.beginPath();
    ctx.arc(0, 0, R_SEG_IN, 0, Math.PI * 2);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    //
    ctx.beginPath();
    ctx.arc(0, 0, R_TRACK_OUT, 0, Math.PI * 2);
    ctx.fillStyle = '#2a1800';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, R_TRACK_IN, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    //
    ctx.beginPath();
    ctx.arc(0, 0, R_BOWL, 0, Math.PI * 2);
    const bowlGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, R_BOWL);
    bowlGrad.addColorStop(0, '#3a1a06');
    bowlGrad.addColorStop(0.7, '#1e0e04');
    bowlGrad.addColorStop(1, '#0e0702');
    ctx.fillStyle = bowlGrad;
    ctx.fill();

    //
    ctx.beginPath();
    ctx.arc(0, 0, R_CONE, 0, Math.PI * 2);
    const coneGrad = ctx.createRadialGradient(-8, -8, 2, 0, 0, R_CONE);
    coneGrad.addColorStop(0, '#6a3a10');
    coneGrad.addColorStop(0.5, '#3a1a06');
    coneGrad.addColorStop(1, '#1a0b00');
    ctx.fillStyle = coneGrad;
    ctx.fill();
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cone inner ring detail
    ctx.beginPath();
    ctx.arc(0, 0, R_CONE - 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Cone gold studs (8 evenly spaced, rotate with wheel)
    for (let i = 0; i < 8; i++) {
      const da = i * (Math.PI / 4) + angle;
      ctx.beginPath();
      ctx.arc(
        Math.cos(da) * (R_CONE - 14),
        Math.sin(da) * (R_CONE - 14),
        2.5, 0, Math.PI * 2
      );
      ctx.fillStyle = '#c9a84c';
      ctx.fill();
    }

    //
    ctx.beginPath();
    ctx.arc(0, 0, R_HUB, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, R_HUB);
    hubGrad.addColorStop(0, '#c9a84c');
    hubGrad.addColorStop(1, '#7a5c18');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#f0c040';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hub centre dot
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0b00';
    ctx.fill();

    ctx.restore();
  }
}