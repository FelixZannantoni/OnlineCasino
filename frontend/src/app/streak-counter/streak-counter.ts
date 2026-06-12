import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-streak-counter',
  imports: [],
  templateUrl: './streak-counter.html',
  styleUrl: './streak-counter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreakCounter {
  streak = input<number>(0);
}
