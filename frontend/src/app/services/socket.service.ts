import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  public isConnected = signal(false);

  constructor() {
    this.socket = io('http://localhost:3000'); // Replace with your backend URL

    this.socket.on('connect', () => {
      this.isConnected.set(true);
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected.set(false);
      console.log('Disconnected from WebSocket server');
    });
  }

  joinGame(gameId: string) {
    this.socket.emit('join_game', gameId);
  }

  onEvent(eventName: string, callback: (data: any) => void) {
    this.socket.on(eventName, callback);
  }

  emitEvent(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
