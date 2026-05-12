import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

export interface PokerPlayer {
  id: string;
  displayname?: string;
  balance: number;
  bet: number;
  folded: boolean;
  cards: any[];
  profileImage?: string;
}

@Component({
  selector: 'app-poker-players',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './poker-players.html',
  styleUrls: ['./poker-players.css']
})
export class PokerPlayersComponent {
  players = input.required<PokerPlayer[]>();
  currentPlayerId = input.required<string | null>();
}