import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    const response = await firstValueFrom(
      this.http.get<{ messages?: ClubChatMessage[] } | ClubChatMessage[]>(`${this.apiUrl}/${clubId}`)
    );

    const messages = Array.isArray(response) ? response : response?.messages;
    if (!Array.isArray(messages)) {
      throw new Error('Club chat response did not contain a messages array.');
    }

    return messages;
  }

  async sendMessage(clubId: number, senderId: string, senderName: string, content: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<{ message: string }>(`${this.apiUrl}/${clubId}`, {
          senderId,
          senderName,
          content
        })
      );
      return true;
    } catch {
      return false;
    }
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