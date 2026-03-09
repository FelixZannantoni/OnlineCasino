import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';
import { DevTeam } from './dev-team/dev-team';
import { Support } from './support/support';
import { Terms } from './terms/terms';
import { PrivacyPolicy } from './privacy-policy/privacy-policy';

type Section = 'menu' | 'dev-team' | 'support' | 'terms' | 'privacy-policy';

@Component({
  selector: 'app-settings-overlay',
  standalone: true,
  imports: [RouterLink, MatIconModule, DevTeam, Support, Terms, PrivacyPolicy],
  templateUrl: './settings-overlay.html',
  styleUrls: ['./settings-overlay.css']
})
export class SettingsOverlay implements OnInit, OnDestroy {
  isOpen = false;
  activeSection: Section = 'menu';
  private toggleSubscription?: Subscription;
  private keydownSubscription?: Subscription;
  private isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.toggleSubscription = fromEvent<CustomEvent>(window, 'toggleSettingsOverlay')
      .subscribe(() => {
        window.dispatchEvent(new CustomEvent('closeOtherOverlays'));
        this.isOpen = !this.isOpen;
        this.activeSection = 'menu';
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
    this.activeSection = 'menu';
    this.updateBodyScroll();
  }

  navigateTo(section: Section): void {
    this.activeSection = section;
  }

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}
