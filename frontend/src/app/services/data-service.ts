import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public readonly userId: WritableSignal<string> = signal('user-123'); // Default user ID for testing
}
