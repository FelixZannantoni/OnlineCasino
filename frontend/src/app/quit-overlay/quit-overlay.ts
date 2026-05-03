import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quit-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './quit-overlay.html',
  styleUrls: ['./quit-overlay.css'],
})
export class QuitOverlay implements OnInit, OnDestroy {
  isOpen = false;
  private redirectTo = '/home'; // default fallback
  private router = inject(Router);
  private toggleSubscription?: Subscription;
  private keydownSubscription?: Subscription;
  private isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // Skip SSR

    this.toggleSubscription = fromEvent<CustomEvent>(window, 'toggleQuitOverlay')
      .subscribe((event) => {
        this.redirectTo = event.detail?.redirectTo ?? '/home';
        window.dispatchEvent(new CustomEvent('closeOtherOverlays'));
        this.isOpen = true; // always open, never toggle
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

  confirm(): void {
    this.close();
    this.router.navigate([this.redirectTo]);
  }

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}
