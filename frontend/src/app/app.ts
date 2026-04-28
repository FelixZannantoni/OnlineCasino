import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Login } from './login/login';
import { ProfileOverlay } from './profile-overlay/profile-overlay';
import { SettingsOverlay } from './settings-overlay/settings-overlay';
import { QuitOverlay } from './quit-overlay/quit-overlay';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Login,
    ProfileOverlay,
    SettingsOverlay,
    QuitOverlay
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  showLogin = true;

  constructor(private router: Router) {

    this.showLogin = this.shouldShowLogin(this.router.url);
    
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