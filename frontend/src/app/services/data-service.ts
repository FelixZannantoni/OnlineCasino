import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly STORAGE_KEY = 'casino_user_id';
  public readonly userId: WritableSignal<string>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

    if (isPlatformBrowser(this.platformId)) {
      let id = sessionStorage.getItem(this.STORAGE_KEY);

      if (!id) {
        id = 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
      }

      this.userId = signal(id);
    } else {
      this.userId = signal('test-user');
    }

  }
}