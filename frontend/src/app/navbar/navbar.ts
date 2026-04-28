import { Component, inject } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  private router = inject(Router);

  get isInGame(): boolean {
    if (true) { // TODO: replace with real in-game check from backend
      const url = this.router.url;
      return url.includes('/poker') || url.includes('/blackjack');
    }
    return false;
  }

  navigate(path: string): void {
  if (this.isInGame) {
    window.dispatchEvent(new CustomEvent('toggleQuitOverlay', { detail: { redirectTo: path } }));
  } else {
    this.router.navigate([path]);
  }
}

  toggleProfile(): void {
    window.dispatchEvent(new CustomEvent('toggleProfileOverlay'));
  }

  toggleSettings(): void {
    window.dispatchEvent(new CustomEvent('toggleSettingsOverlay'));
  }
}