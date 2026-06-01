import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, afterNextRender, computed, signal, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

interface ClubMember {
  id: string;
  name: string;
  role: 'owner' | 'officer' | 'member';
  status: 'online' | 'away' | 'offline';
  activity: string;
  color: string;
  hue: string;
  init: string;
  contribution: number;
}

interface ClubMessage {
  memberId: string;
  memberName: string;
  memberInit: string;
  memberColor: string;
  memberHue: string;
  mine: boolean;
  text: string;
  time: string;
}

type Tab = 'members' | 'chat' | 'info';

const ROLE_GROUPS: { label: string; roles: ReadonlyArray<ClubMember['role']> }[] = [
  { label: 'Leadership', roles: ['owner', 'officer'] },
  { label: 'Members', roles: ['member'] },
];

@Component({
  selector: 'app-club',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './club.html',
  styleUrl: './club.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Club {
  @ViewChild('chatContainer') private chatContainer?: ElementRef<HTMLElement>;

  // State 
  readonly activeTab = signal<Tab>('members');
  readonly searchQuery = signal('');
  readonly messageInput = signal('');
  readonly toastHidden = signal(true);
  readonly toastMessage = signal('');

  private readonly _messages = signal<ClubMessage[]>([
    { memberId: 'golden', memberName: 'GoldenRush', memberInit: 'GR', memberColor: 'linear-gradient(135deg,#1e1a10,#2a2210)', memberHue: '#d4a017', mine: false, text: "Who's up for a poker run tonight?", time: '9:12 AM' },
    { memberId: 'night', memberName: 'NightDealer', memberInit: 'ND', memberColor: 'linear-gradient(135deg,#0f1e1a,#122820)', memberHue: '#1D9E75', mine: false, text: "I'm in. Let's push the vault past 200k this week!", time: '9:14 AM' },
    { memberId: 'me', memberName: 'You', memberInit: 'ME', memberColor: 'linear-gradient(135deg,#1a1228,#261840)', memberHue: '#7F77DD', mine: true, text: 'Absolutely. Blackjack table is calling my name.', time: '9:15 AM' },
    { memberId: 'blaze', memberName: 'BlazeMerchant', memberInit: 'BM', memberColor: 'linear-gradient(135deg,#1e1510,#2a1e10)', memberHue: '#EF9F27', mine: false, text: "I'll catch up later, gotta step out for a bit.", time: '9:22 AM' },
  ]);

  // Static data 
  readonly club = {
    name: 'THE VELVET VAULT',
    tag: '#VAULT',
    motto: 'Fortune Favours the Bold',
    level: 7,
    xp: 7340,
    xpNext: 10000,
    totalWinnings: 184200,
    founded: 'March 2024',
  } as const;

  readonly members: ClubMember[] = [
    { id: 'velvet', name: 'VelvetAce', role: 'owner', status: 'online', activity: 'Playing Poker', color: 'linear-gradient(135deg,#1a1228,#261840)', init: 'VA', hue: '#7F77DD', contribution: 54200 },
    { id: 'golden', name: 'GoldenRush', role: 'officer', status: 'online', activity: 'Playing Blackjack', color: 'linear-gradient(135deg,#1e1a10,#2a2210)', init: 'GR', hue: '#d4a017', contribution: 38900 },
    { id: 'night', name: 'NightDealer', role: 'officer', status: 'online', activity: 'In Lobby', color: 'linear-gradient(135deg,#0f1e1a,#122820)', init: 'ND', hue: '#1D9E75', contribution: 32100 },
    { id: 'blaze', name: 'BlazeMerchant', role: 'member', status: 'away', activity: 'Away', color: 'linear-gradient(135deg,#1e1510,#2a1e10)', init: 'BM', hue: '#EF9F27', contribution: 21700 },
    { id: 'steel', name: 'SteelBluff', role: 'member', status: 'offline', activity: 'Last seen 2h ago', color: 'linear-gradient(135deg,#141428,#1e1e34)', init: 'SB', hue: '#85B7EB', contribution: 19400 },
    { id: 'dusk', name: 'DuskCroupier', role: 'member', status: 'offline', activity: 'Last seen yesterday', color: 'linear-gradient(135deg,#1e1818,#2a2020)', init: 'DC', hue: '#F09595', contribution: 17900 },
  ];

  readonly roleGroups = ROLE_GROUPS;

  // Computed 
  readonly messages = computed(() => this._messages());

  readonly onlineCount = computed(() =>
    this.members.filter(m => m.status === 'online').length
  );

  readonly xpPercent = computed(() =>
    Math.round((this.club.xp / this.club.xpNext) * 100)
  );

  readonly filteredMembers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q ? this.members.filter(m => m.name.toLowerCase().includes(q)) : this.members;
  });

  readonly topContributors = computed(() =>
    [...this.members].sort((a, b) => b.contribution - a.contribution).slice(0, 5)
  );

  // Helpers 
  getMembersByRoles(roles: ReadonlyArray<ClubMember['role']>): ClubMember[] {
    return this.filteredMembers().filter(m => roles.includes(m.role));
  }

  formatCoins(n: number): string {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();
  }

  getRoleLabel(role: ClubMember['role']): string {
    if (role === 'owner') return 'Owner';
    if (role === 'officer') return 'Officer';
    return '';
  }

  getRoleIcon(role: ClubMember['role']): string {
    if (role === 'owner') return 'workspace_premium';
    if (role === 'officer') return 'military_tech';
    return '';
  }

  getRankIcon(index: number): string {
    if (index === 0) return 'workspace_premium';
    if (index === 1) return 'military_tech';
    if (index === 2) return 'grade';
    return 'tag';
  }

  // Actions 
  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'chat') this.scrollToBottom();
  }

  sendMsg(): void {
    const txt = this.messageInput().trim();
    if (!txt) return;

    const now = new Date();
    const h = now.getHours();
    const min = String(now.getMinutes()).padStart(2, '0');
    const time = `${h % 12 || 12}:${min} ${h < 12 ? 'AM' : 'PM'}`;

    this._messages.update(msgs => [...msgs, {
      memberId: 'me',
      memberName: 'You',
      memberInit: 'ME',
      memberColor: 'linear-gradient(135deg,#1a1228,#261840)',
      memberHue: '#7F77DD',
      mine: true,
      text: txt,
      time,
    }]);

    this.messageInput.set('');
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    afterNextRender(() => {
      this.chatContainer?.nativeElement.scrollTo({
        top: this.chatContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    });
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    this.toastHidden.set(false);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastHidden.set(true), 3200);
  }
}