import { Component } from '@angular/core';
import { TableGameComponent } from '../table-game';

@Component({
  selector: 'app-poker',
  standalone: true,
  imports: [TableGameComponent],
  templateUrl: './poker.html',
  styleUrls: ['./poker.css']
})
export class Poker {
  balance: number = 1000;
  pot: number = 150;
}
