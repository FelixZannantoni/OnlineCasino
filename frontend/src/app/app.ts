import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Login } from './login/login';
import { ProfileOverlay } from './profile-overlay/profile-overlay';
import { SettingsOverlay } from './settings-overlay/settings-overlay';
import { QuitOverlay } from './quit-overlay/quit-overlay';
import { InformationOverlay } from './information-overlay/information-overlay';
import { SocketService } from './services/socket.service';

import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
//import { PauseOverlay } from './pause-overlay/pause-overlay';
import { GameModeOverlay } from './game-mode-overlay/game-mode-overlay';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    ProfileOverlay,
    SettingsOverlay,
    //PauseOverlay,
    QuitOverlay,
    InformationOverlay,
    GameModeOverlay
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('frontend');
  showLogin = true;
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private socketService = inject(SocketService);

  constructor() {
    this.showLogin = this.shouldShowLogin(this.router.url);

    // Listen for leave_game event from quit overlay
    if (isPlatformBrowser(this.platformId)) {
      fromEvent<CustomEvent<{ gameId: string }>>(window, 'leave_game')
        .subscribe((event) => {
          if (this.socketService.isConnected()) {
            this.socketService.emitEvent('leave_game', { gameId: event.detail.gameId });
          }
        });
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showLogin = this.shouldShowLogin(event.url);
    });
  }

  private shouldShowLogin(url: string): boolean {
    return url.includes('/login') || url.includes('/forgot-password') || url === '/';
  }
}