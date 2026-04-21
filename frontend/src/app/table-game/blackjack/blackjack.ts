import { Component } from '@angular/core';
import { TableGameComponent } from '../table-game';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  imports: [TableGameComponent],
  templateUrl: './blackjack.html',
  styleUrl: './blackjack.css',
})
export class Blackjack {
  balance: number = 1000;
  pot: number = 0;
}
