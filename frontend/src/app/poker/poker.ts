import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';

const BASE_URL = 'http://localhost:3000';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatIconModule],
  templateUrl: './poker.html',
  styleUrls: ['./poker.css']
})
export class Poker implements OnInit, OnDestroy {
  gameState = {
    pot: 1000,
    currentBet: 100,
    currentPlayerId: '1',  // ID des Spielers, der gerade dran ist
    boardCards: [
        { suit: 'hearts', rank: 'A' },
        { suit: 'clubs', rank: '10' },
        { suit: 'diamonds', rank: '5' },
        { suit: 'spades', rank: 'K' },
        { suit: 'hearts', rank: '3' }
    ],
    playerCards: [
        { suit: 'hearts', rank: 'J' },
        { suit: 'clubs', rank: '7' }
    ],
    players: [
        {
            playerId: '1',
            username: 'Player1',
            displayName: 'Player 1',
            balance: 1000,
            bet: 50,
            isDealer: false,
            isCurrentPlayer: true,  // wird dynamisch gesetzt
            cards: [
                { suit: 'hearts', rank: 'J' },
                { suit: 'clubs', rank: '7' }
            ]
        },
        {
            playerId: '2',
            username: 'Player2',
            displayName: 'Player 2',
            balance: 850,
            bet: 0,
            isDealer: true,
            isCurrentPlayer: false,
            cards: []  // Gegner-Karten sind verdeckt
        },
        {
            playerId: '3',
            username: 'Player3',
            displayName: 'Player 3',
            balance: 1200,
            bet: 100,
            isDealer: false,
            isCurrentPlayer: false,
            cards: []
        },
        {
            playerId: '4',
            username: 'Player4',
            displayName: 'Player 4',
            balance: 1000,
            bet: 50,
            isDealer: false,
            isCurrentPlayer: true,  // wird dynamisch gesetzt
            cards: [
                { suit: 'hearts', rank: 'J' },
                { suit: 'clubs', rank: '7' }
            ]
        },
        {
            playerId: '5',
            username: 'Player5',
            displayName: 'Player 5',
            balance: 1000,
            bet: 50,
            isDealer: false,
            isCurrentPlayer: true,  // wird dynamisch gesetzt
            cards: [
                { suit: 'hearts', rank: 'J' },
                { suit: 'clubs', rank: '7' }
            ]
        }
    ]
};

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

  fold(playerId: string, gameId: string) {
    this.http.put(`${BASE_URL}/poker/fold`, { 
      playerId, 
      gameId 
    }).subscribe(response => {
      console.log('Fold erfolgreich:', response);
    });
  }

  check(playerId: string, gameId: string) {
    this.http.put(`${BASE_URL}/poker/check`, { 
      playerId, 
      gameId 
    }).subscribe(response => {
      console.log('Check erfolgreich:', response);
    });
  }

  bet(playerId: string, gameId: string, amount: number) {
    this.http.put(`${BASE_URL}/poker/bet`, { 
      playerId, 
      gameId, 
      betAmount: amount 
    }).subscribe(response => {
      console.log('Bet erfolgreich:', response);
    });
  }

  call(playerId: string, gameId: string) {
    this.http.put(`${BASE_URL}/poker/call`, { 
      playerId, 
      gameId 
    }).subscribe(response => {
      console.log('Call erfolgreich:', response);
    }); 
  }

  getSuitClass(suit: string): string {
    return `suit-${suit}`;
  }

  getCurrentPlayerBalance(): number {
    const currentPlayer = this.gameState.players.find(p => p.playerId === this.gameState.currentPlayerId);
    return currentPlayer?.balance ?? 0;
  }

  isCurrentPlayer(playerId: string): boolean {
    return playerId === this.gameState.currentPlayerId;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add('poker-page');
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('poker-page');
    }
  }
}


/* Kartenanwendungen 
<!-- Einfach Karte einfügen mit Inline-Styles -->
<div class="card card-hearts suit-hearts" 
      style="width: 70px; height: 98px; transform: rotate(30deg);">
  <div class="card-top">
    <span class="card-rank">A</span>
    <span class="card-suit suit-hearts"></span>
  </div>
  <div class="card-center suit-hearts"></div>
  <div class="card-bottom">
    <span class="card-rank">A</span>
    <span class="card-suit suit-hearts"></span>
  </div>
</div>
*/