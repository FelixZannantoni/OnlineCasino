import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';

const BASE_URL = 'http://localhost:3000';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatIconModule],
  templateUrl: './poker.html',
  styleUrls: ['./poker.css']
})
export class Poker {
  constructor(private http: HttpClient) {}

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