import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Login } from './login/login';
import { ProfileOverlay } from './profile-overlay/profile-overlay';
import { SettingsOverlay } from './settings-overlay/settings-overlay';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Navbar,
    Login,
    ProfileOverlay,
    SettingsOverlay
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  showLogin = true;

  constructor(private router: Router) {
    console.log('App init, URL:', this.router.url, 'showLogin:', this.showLogin);
    
    this.showLogin = this.router.url === '/login' || this.router.url === '/';
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('NavigationEnd:', event.url, '→ showLogin:', (event.url === '/login' || event.url === '/'));
      this.showLogin = event.url === '/login' || event.url === '/';
    });
  }
}