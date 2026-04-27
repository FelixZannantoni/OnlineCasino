import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, signal, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-poker',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatIconModule, CommonModule],
  templateUrl: './poker.html',
  styleUrls: ['./poker.css']
})
export class Poker implements OnInit, OnDestroy {
  private socketService = inject(SocketService);
  private route = inject(ActivatedRoute);
  
  public gameState = signal<any>(null);
  public gameId = signal<string | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add('poker-page');
      
      // Get gameId from route params or use a default for testing
      const id = this.route.snapshot.paramMap.get('id') || '1';
      this.gameId.set(id);

      const userId: string = localStorage.getItem('userId') ?? 'user-123';
      
      this.socketService.joinGame(id, userId);
      
      this.socketService.onEvent('game_state', (state) => {
        console.log('Received game state:', state);
        this.gameState.set(state);
      });
    }
  }

  makeMove(action: string, amount?: number) {
    const gid = this.gameId();
    if (gid) {
      const userId: string = localStorage.getItem('userId') ?? 'user-123';
      console.log("USERID: ", userId);
      this.socketService.emitEvent('player_move', {
        gameId: gid,
        action,
        amount
      });
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