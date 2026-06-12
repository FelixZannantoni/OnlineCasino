import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { StreakCounter } from '../streak-counter/streak-counter';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  streak: number;
  badge?: string;
}

@Component({
  selector: 'app-leaderboard',
  imports: [StreakCounter],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Leaderboard {
  readonly activeFilter = signal<'weekly' | 'monthly' | 'alltime'>('weekly');

  readonly players = signal<LeaderboardEntry[]>([
    { rank: 1, username: 'AceHunter',  avatar: 'AH', score: 128_450, streak: 21, badge: 'High Roller'  },
    { rank: 2, username: 'VelvetKing', avatar: 'VK', score: 115_900, streak: 14, badge: 'Bluff Master' },
    { rank: 3, username: 'LuckyDeal',  avatar: 'LD', score: 98_300,  streak: 9  },
    { rank: 4, username: 'CardShark',  avatar: 'CS', score: 87_150,  streak: 5  },
    { rank: 5, username: 'RoyalFlush', avatar: 'RF', score: 74_800,  streak: 3  },
    { rank: 6, username: 'NightOwl',   avatar: 'NO', score: 63_200,  streak: 7  },
    { rank: 7, username: 'SilkRoad',   avatar: 'SR', score: 51_600,  streak: 2  },
  ]);

  readonly topThree = computed(() => this.players().slice(0, 3));
  readonly rest     = computed(() => this.players().slice(3));

  setFilter(f: 'weekly' | 'monthly' | 'alltime'): void {
    this.activeFilter.set(f);
  }

  formatScore(n: number): string {
    return n.toLocaleString('en-US');
  }
}
