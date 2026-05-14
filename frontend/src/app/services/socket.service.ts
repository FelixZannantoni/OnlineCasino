import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  public isConnected = signal(false);

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      this.isConnected.set(true);
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected.set(false);
      console.log('Disconnected from WebSocket server');
    });
  }

  joinGame(gameId: string, userId: string) {
    if (this.socket.connected) {
      this.socket.emit('join_game', gameId, userId);
      return;
    }

    this.socket.once('connect', () => {
      this.socket.emit('join_game', gameId, userId);
    });
  }

  onEvent(eventName: string, callback: (data: unknown) => void) {
    this.socket.on(eventName, callback);
  }

  offEvent(eventName: string) {
    this.socket.off(eventName);
  }

  emitEvent(eventName: string, data: unknown) {
    this.socket.emit(eventName, data);
  }
}
