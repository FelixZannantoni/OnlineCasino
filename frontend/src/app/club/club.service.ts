import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ClubUserDisplay {
  uuid: string;
  username: string;
  displayname: string;
  status: string;
}

export interface ClubDetails {
  id: number;
  name: string;
  members: ClubUserDisplay[];
}

export interface ClubSummary {
  id: number;
  name: string;
  memberCount: number;
  totalBalance: number;
}

@Injectable({
  providedIn: 'root',
})
export class ClubService {
  private readonly apiUrl = '/clubs';

  constructor(private readonly http: HttpClient) {}

  async getMyClub(userId: string): Promise<ClubDetails | null> {
    return await firstValueFrom(
      this.http.get<ClubDetails | null>(this.apiUrl, { params: { userId } })
    );
  }

  async getClubs(): Promise<ClubSummary[]> {
    return await firstValueFrom(this.http.get<ClubSummary[]>(this.apiUrl));
  }

  async createClub(userId: string, name: string): Promise<ClubDetails> {
    return await firstValueFrom(this.http.post<ClubDetails>(this.apiUrl, { userId, name }));
  }

  async joinClub(userId: string, clubId: number): Promise<ClubDetails> {
    return await firstValueFrom(this.http.put<ClubDetails>(`${this.apiUrl}/${clubId}`, { userId }));
  }

  async leaveClub(userId: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/membership`, { body: { userId } }));
  }
}
