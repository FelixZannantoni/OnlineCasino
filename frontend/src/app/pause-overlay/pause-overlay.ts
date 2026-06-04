import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';

export interface PauseState {
  isOpen: boolean;
  title: string;
  message: string;
  timerSeconds?: number | null; // Optional: Countdown anzeigen
}

@Component({
  selector: 'app-pause-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './pause-overlay.html',
  styleUrls: ['./pause-overlay.css']
})
export class PauseOverlay implements OnInit, OnDestroy {
  state: PauseState = {
    isOpen: false,
    title: '',
    message: '',
    timerSeconds: null
  };

  private toggleSubscription?: Subscription;
  private closeSubscription?: Subscription;
  private keydownSubscription?: Subscription;
  private isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Öffnen des Overlays mit Daten
    this.toggleSubscription = fromEvent<CustomEvent<PauseState>>(window, 'togglePauseOverlay')
      .subscribe((event) => {
        window.dispatchEvent(new CustomEvent('closeOtherOverlays'));
        this.state = { ...event.detail, isOpen: true };
        this.updateBodyScroll();
      });

    // Schließen durch andere Overlays oder Escape
    this.closeSubscription = fromEvent(window, 'closeOtherOverlays').subscribe(() => {
      if (this.state.isOpen) this.close();
    });

    this.keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown')
      .subscribe((event) => {
        if (event.key === 'Escape' && this.state.isOpen) {
          this.close();
        }
      });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.toggleSubscription?.unsubscribe();
    this.closeSubscription?.unsubscribe();
    this.keydownSubscription?.unsubscribe();
  }

  close(): void {
    this.state = { ...this.state, isOpen: false };
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.state.isOpen ? 'hidden' : '';
  }
}