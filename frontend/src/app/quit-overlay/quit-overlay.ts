import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-quit-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './quit-overlay.html',
  styleUrls: ['./quit-overlay.css'],
})
export class QuitOverlay {
  isOpen = false;
  private redirectTo = '/home'; // default fallback
  private router = inject(Router);
  private socketService = inject(SocketService);
  private isBrowser: boolean;
  private gameId?: string;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostListener('window:toggleQuitOverlay', ['$event'])
  handleToggle(event: Event): void {
    if (!this.isBrowser) return;
    const detail = (event as CustomEvent<{ redirectTo?: string; gameId?: string }>).detail;
    this.redirectTo = detail?.redirectTo ?? '/home';
    this.gameId = detail?.gameId;
    this.isOpen = true;
    this.updateBodyScroll();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.updateBodyScroll();
  }

  confirm(): void {
    this.close();
    if (this.gameId) {
      this.socketService.emitEvent('leave_game', { gameId: this.gameId });
    }
    this.router.navigate([this.redirectTo]);
  }

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}