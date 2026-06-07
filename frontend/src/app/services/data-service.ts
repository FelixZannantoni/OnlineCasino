import { Injectable, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly STORAGE_KEY = 'userId';
  public readonly userId: WritableSignal<string | null>;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Initialisierung: Lade ID aus LocalStorage wenn im Browser
    const initialId = this.isBrowser ? localStorage.getItem(this.STORAGE_KEY) : null;

    this.userId = signal(initialId);
    console.log('id we got from local storage: ' + this.userId());
  }

  /**
   * Setzt die UserID nach erfolgreichem Login und speichert sie persistent.
   */
  setLoggedInUser(id: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, id);
      this.userId.set(id);
      console.log(`[DataService] User logged in with ID: ${id}`);
    }
  }

  /**
   * Entfernt die UserID beim Logout.
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.userId.set(null);
      console.log('[DataService] User logged out');
    }
  }

  /**
   * Gibt die aktuelle UserID zurück (oder null).
   */
  getUserId(): string | null {
    return this.userId();
  }
}