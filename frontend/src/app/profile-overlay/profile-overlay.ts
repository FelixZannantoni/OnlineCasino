import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';
import { DataService } from '../services/data-service';
import { execArgv } from 'process';

@Component({
  selector: 'app-profile-overlay',
  standalone: true,
  imports: [RouterLink, MatIconModule, CommonModule],
  templateUrl: './profile-overlay.html',
  styleUrls: ['./profile-overlay.css']
})
export class ProfileOverlay implements OnInit, OnDestroy {
  isOpen = false;
  private toggleSubscription?: Subscription;
  private keydownSubscription?: Subscription;
  private isBrowser: boolean;

  // user data
  public userId: string | null = null;
  public username: string | null = null;
  public displayName: string | null = null;
  public balance: number | null = null;
  public profileImageUrl = 'https://via.placeholder.com/100';
  private readonly dataService = inject(DataService);

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return; // Skip SSR

    this.toggleSubscription = fromEvent<CustomEvent>(window, 'toggleProfileOverlay')
      .subscribe(() => {
        window.dispatchEvent(new CustomEvent('closeOtherOverlays'));
        this.isOpen = !this.isOpen;
        this.updateBodyScroll();
        if (this.isOpen) this.loadUserData();
      });

    fromEvent(window, 'closeOtherOverlays').subscribe(() => {
      if (this.isOpen) this.close();
    });

    this.keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown')
      .subscribe((event) => {
        if (event.key == 'Escape' && this.isOpen) {
          this.close();
          console.log('pressed escape')
        }
      });
  }

  private async loadUserData(): Promise<void> {
    if (!this.isBrowser) return;
    const id = this.dataService.getUserId();
    this.userId = id;
    if (!id) return;

    try {
      const res = await fetch(`/users/${id}`);
      if (!res.ok) return;
      const body = await res.json();
      this.username = body.username || null;
      this.displayName = body.displayname || null;
      this.balance = typeof body.balance === 'number' ? body.balance : null;
      // keep placeholder image for now; could extend backend with avatar URL

      // console.log(this.userId, this.username, this.displayName, this.balance)
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.toggleSubscription?.unsubscribe();
    this.keydownSubscription?.unsubscribe();
  }

  close(): void {
    this.isOpen = false;
    this.updateBodyScroll();
    console.log('closing...')
  }

  private updateBodyScroll(): void {
    if (!this.isBrowser) return;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  }
}