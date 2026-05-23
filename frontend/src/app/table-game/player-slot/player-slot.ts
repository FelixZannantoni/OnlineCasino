import {Component, input} from '@angular/core';
import {getCardRank} from '../../services/card-utils';

@Component({
  selector: 'app-player-slot',
  imports: [],
  templateUrl: './player-slot.html',
  styleUrl: './player-slot.css',
})
export class PlayerSlot {
  // Inputs
  displayName = input.required<string>();
  balance = input.required<number>();
  bet = input<number>(0);
  isDealer = input<boolean>(false);
  isCurrent = input<boolean>(false);
  isMe = input<boolean>(false);

  cards = input<any[]>([]);
  handValue = input<number>(0);

  showCards = input<boolean>(true);
  cardSize = input<'small' | 'normal'>('normal');

  getRank(name: string): string {
    return getCardRank(name);
  }
}
