import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ClubChatMessage } from '../models/club-chat-message.model';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ClubChatService {
  private readonly apiUrl = '/club-chat';

  constructor(
    private readonly http: HttpClient,
    private readonly socketService: SocketService
  ) {}

  async getClubChatMessages(clubId: number): Promise<ClubChatMessage[]> {
    const params = new HttpParams().set('clubId', clubId.toString());
    const response = await firstValueFrom(
      this.http.get<{ messages: ClubChatMessage[] }>(this.apiUrl, { params })
    );

    return response.messages ?? [];
  }

  async sendMessage(clubId: number, senderId: string, senderName: string, content: string): Promise<boolean> {
    return await firstValueFrom(
      this.http.post<{ message: string }>(`${this.apiUrl}/${clubId}`, {
        senderId,
        senderName,
        content
      }))
      .then(() => true)
      .catch(() => false);
  }

  onNewClubMessage(callback: (message: ClubChatMessage) => void) {
    this.socketService.onEvent('club_message', (data: unknown) => {
      const payload = data as {
        type?: string;
        clubId?: number;
        senderId?: string;
        senderName?: string;
        content?: string;
        timestamp?: string;
      };

      if (payload.type === 'new_message') {
        callback({
          id: 0,
          clubId: payload.clubId ?? 0,
          senderId: payload.senderId ?? '',
          senderName: payload.senderName ?? 'System',
          content: payload.content ?? '',
          timestamp: payload.timestamp ?? new Date().toISOString()
        });
      }
    });
  }

  clearNewClubMessageListener() {
    this.socketService.offEvent('club_message');
  }
}