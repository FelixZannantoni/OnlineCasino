import { Component, OnInit, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { DataService } from '../services/data-service';
import { Avatar } from '../avatar/avatar';
import { getModeConfigByMode } from '../game-mode-overlay/game-mode-overlay';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, Avatar],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private dataService = inject(DataService);
  private isBrowser: boolean;

  readonly displayName = signal<string | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadDisplayName();
  }

  private async loadDisplayName(): Promise<void> {
    const id = this.dataService.getUserId();
    if (!id) return;

    try {
      const res = await fetch(`/users/${id}`);
      if (!res.ok) return;
      const body = await res.json();
      this.displayName.set(body.displayname || body.username || null);
    } catch (e) {
      console.error('[Navbar] Failed to load user data', e);
    }
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
      window.dispatchEvent(new CustomEvent('toggleQuitOverlay', {
        detail: { redirectTo: path, gameId: this.getCurrentGameId() }
      }));
    } else {
      this.router.navigate([path]);
    }
  }

  private getCurrentGameId(): string | undefined {
    const url = this.router.url;
    const mode = new URLSearchParams(url.split('?')[1] ?? '').get('mode') ?? 'low';
    const modeConfig = getModeConfigByMode(mode);

    if (url.includes('/poker')) return modeConfig.pokerId;
    if (url.includes('/blackjack')) return modeConfig.blackjackId;
    return undefined;
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