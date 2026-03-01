import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  toggleProfile(): void {
    window.dispatchEvent(new CustomEvent('toggleProfileOverlay'));
  }

  toggleSettings(): void {
    window.dispatchEvent(new CustomEvent('toggleSettingsOverlay'));
  }
}