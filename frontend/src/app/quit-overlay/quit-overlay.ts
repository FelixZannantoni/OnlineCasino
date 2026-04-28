import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-quit-overlay',
  imports: [RouterLink, MatIcon],
  templateUrl: './quit-overlay.html',
  styleUrl: './quit-overlay.css',
})
export class QuitOverlay implements OnInit, OnDestroy{
  isOpen = false;
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
      .subscribe(() => {
        window.dispatchEvent(new CustomEvent('closeOtherOverlays'));
        this.isOpen = !this.isOpen;
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

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}
