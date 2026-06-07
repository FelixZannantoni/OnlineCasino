import { Component, inject, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  private router = inject(Router);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get isInGame(): boolean {
    if (true) { // TODO: replace with real in-game check from backend
      const url = this.router.url;
      return url.includes('/poker') || url.includes('/blackjack');
    }
    return false;
  }

  navigate(path: string): void {
    if (this.isInGame && this.isBrowser) {
      window.dispatchEvent(new CustomEvent('toggleQuitOverlay', { detail: { redirectTo: path } }));
    } else {
      this.router.navigate([path]);
    }
  }

  toggleProfile(): void {
    if (this.isBrowser) {
      window.dispatchEvent(new CustomEvent('toggleProfileOverlay'));
    }
  }

  toggleSettings(): void {
    if (this.isBrowser) {
      window.dispatchEvent(new CustomEvent('toggleSettingsOverlay'));
    }
  }
}