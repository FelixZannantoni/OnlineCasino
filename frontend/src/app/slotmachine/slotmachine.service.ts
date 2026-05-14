import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SpinResult {
  slots: number[][];
  win: number;
  balance: number;
  winningLines: number[];
}

@Injectable({
  providedIn: 'root'
})
export class SlotmachineService {
  private apiUrl = 'http://localhost:3000/slotmachine';

  constructor(private http: HttpClient) {}

  async createGame(playerId: string, username: string, displayname: string, balance: number): Promise<string> {
    const res = await firstValueFrom(this.http.post<{ gameId: string }>(`${this.apiUrl}/create`, {
      playerId,
      username,
      displayname,
      balance
    }));
    return res.gameId;
  }

  async spin(gameId: string, bet: number): Promise<SpinResult> {
    return await firstValueFrom(this.http.post<SpinResult>(`${this.apiUrl}/spin`, {
      gameId,
      bet
    }));
  }
}
