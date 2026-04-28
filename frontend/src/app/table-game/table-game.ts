import { Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID, HostBinding, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table-game',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './table-game.html',
  styleUrls: ['./table-game.css', '../ui/chips/chips.css'],
  encapsulation: ViewEncapsulation.None
})
export class TableGameComponent implements OnInit, OnDestroy {
  @Input() game: 'poker' | 'blackjack' | string = 'poker';
  @Input() balance: number = 1000;
  @Input() pot: number = 0;
  @Input() showPot: boolean = true;
  @Input() showActions: boolean = true;

  @HostBinding('class') get hostClass(): string {
    return `game-${this.game}`;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add(`${this.game}-page`);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove(`${this.game}-page`);
    }
  }

  toggleQuitOverlay(): void {
  window.dispatchEvent(new CustomEvent('toggleQuitOverlay', { detail: { redirectTo: '/home' } }));
}
}