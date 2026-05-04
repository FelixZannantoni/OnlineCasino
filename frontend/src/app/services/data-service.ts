import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly STORAGE_KEY = 'casino_user_id';
  public readonly userId: WritableSignal<string>;

  constructor() {
    let id = sessionStorage.getItem(this.STORAGE_KEY);

    if (!id) {
      
      id = 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
      sessionStorage.setItem(this.STORAGE_KEY, id);
    }

    this.userId = signal(id);
  }
}