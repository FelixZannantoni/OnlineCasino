import {Component, input} from '@angular/core';
import {getCardRank} from '../../services/card-utils';
import {Avatar} from '../../avatar/avatar';

@Component({
  selector: 'app-player-slot',
  imports: [Avatar],
  templateUrl: './player-slot.html',
  styleUrl: './player-slot.css',
})
export class PlayerSlot {
  displayName = input.required<string>();
  balance = input.required<number>();
  bet = input<number>(0);
  minBet = input<number>(0);
  maxBet = input<number>(0);
  isDealer = input<boolean>(false);
  isCurrent = input<boolean>(false);
  isMe = input<boolean>(false);

  cards = input<any[]>([]);
  handValue = input<number>(0);

  getRank(name: string): string {
    return getCardRank(name);
  }
}
