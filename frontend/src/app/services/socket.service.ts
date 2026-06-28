import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket?: Socket;
  public isConnected = signal(false);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.socket = io('/', {
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        this.isConnected.set(true);
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected.set(false);
        console.log('Disconnected from WebSocket server');
      });
    }
  }

  joinGame(gameId: string, userId: string, stakes?: string, gameName?: string) {
    if (!this.isBrowser || !this.socket) return;

    if (this.socket.connected) {
      this.socket.emit('join_game', gameId, userId, stakes, gameName);
      return;
    }

    this.socket.once('connect', () => {
      this.socket?.emit('join_game', gameId, userId, stakes, gameName);
    });
  }

  onEvent(eventName: string, callback: (data: unknown) => void) {
    if (!this.isBrowser || !this.socket) return;
    this.socket.on(eventName, callback);
  }

  offEvent(eventName: string) {
    if (!this.isBrowser || !this.socket) return;
    this.socket.off(eventName);
  }

  emitEvent(eventName: string, data: unknown) {
    if (!this.isBrowser || !this.socket) return;
    this.socket.emit(eventName, data);
  }

  register(userId: string) {
    if (this.socket) {
      this.socket.emit('register', userId);
    }
  }

  onNewMessage(callback: () => void) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }
}
