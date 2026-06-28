import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  afterNextRender,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

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

interface PublicClub {
  id: string;
  name: string;
  tag: string;
  motto: string;
  emblemIcon: string;
  totalWinnings: number;
  memberCount: number;
  maxMembers: number;
  open: boolean;
  color: string;
}

type Tab = 'members' | 'chat' | 'info' | 'explore';

const ROLE_GROUPS: { label: string; roles: ReadonlyArray<ClubMember['role']> }[] = [
  { label: 'Leadership', roles: ['owner', 'officer'] },
  { label: 'Members', roles: ['member'] },
];

const CHIPS_PER_LEVEL = 10_000;
const CREATE_CLUB_COST = 10_000;

function computeLevel(totalWinnings: number): number {
  return Math.max(1, Math.floor(totalWinnings / CHIPS_PER_LEVEL));
}

function xpInCurrentLevel(totalWinnings: number): number {
  return totalWinnings % CHIPS_PER_LEVEL;
}

@Component({
  selector: 'app-club',
  imports: [FormsModule],
  templateUrl: './club.html',
  styleUrl: './club.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Club {
  @ViewChild('chatContainer') private chatContainer?: ElementRef<HTMLElement>;

  readonly activeTab = signal<Tab>('members');
  readonly searchQuery = signal('');
  readonly messageInput = signal('');
  readonly toastHidden = signal(true);
  readonly toastMessage = signal('');

  readonly exploreQuery = signal('');
  readonly showCreateForm = signal(false);
  readonly newClubName = signal('');
  readonly newClubTag = signal('');
  readonly newClubMotto = signal('');
  readonly playerCoins = signal(42_500);

  private readonly _messages = signal<ClubMessage[]>([
    { memberId: 'golden', memberName: 'GoldenRush', memberInit: 'GR', memberColor: 'linear-gradient(135deg,#1e1a10,#2a2210)', memberHue: '#d4a017', mine: false, text: "Who's up for a poker run tonight?", time: '9:12 AM' },
    { memberId: 'night', memberName: 'NightDealer', memberInit: 'ND', memberColor: 'linear-gradient(135deg,#0f1e1a,#122820)', memberHue: '#1D9E75', mine: false, text: "I'm in. Let's push the vault past 200k this week!", time: '9:14 AM' },
    { memberId: 'me', memberName: 'You', memberInit: 'ME', memberColor: 'linear-gradient(135deg,#1a1228,#261840)', memberHue: '#7F77DD', mine: true, text: 'Absolutely. Blackjack table is calling my name.', time: '9:15 AM' },
    { memberId: 'blaze', memberName: 'BlazeMerchant', memberInit: 'BM', memberColor: 'linear-gradient(135deg,#1e1510,#2a1e10)', memberHue: '#EF9F27', mine: false, text: "I'll catch up later, gotta step out for a bit.", time: '9:22 AM' },
  ]);

  private readonly _totalWinnings = signal(184_200);

  readonly club = {
    name: 'THE VELVET VAULT',
    tag: '#VAULT',
    motto: 'Fortune Favours the Bold',
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

  private readonly _publicClubs = signal<PublicClub[]>([
    { id: 'royal', name: 'ROYAL FLUSH SOCIETY', tag: '#ROYAL', motto: 'All In, Always', emblemIcon: 'diamond', totalWinnings: 320_000, memberCount: 12, maxMembers: 20, open: true, color: 'linear-gradient(135deg,#1a0e2a,#2a1840)' },
    { id: 'iron', name: 'IRON DEALER GUILD', tag: '#IRON', motto: 'Steel Nerves Win Tables', emblemIcon: 'shield', totalWinnings: 215_000, memberCount: 8, maxMembers: 15, open: true, color: 'linear-gradient(135deg,#141e28,#1a2a38)' },
    { id: 'shadow', name: 'SHADOW SYNDICATE', tag: '#SHAD', motto: 'The Dark Horse Wins', emblemIcon: 'visibility_off', totalWinnings: 178_000, memberCount: 6, maxMembers: 10, open: false, color: 'linear-gradient(135deg,#0e0e1a,#181828)' },
    { id: 'blaze', name: 'BLAZE POKER HOUSE', tag: '#BLAZE', motto: 'Play Hot, Win Hotter', emblemIcon: 'local_fire_department', totalWinnings: 143_000, memberCount: 9, maxMembers: 15, open: true, color: 'linear-gradient(135deg,#2a1008,#381808)' },
    { id: 'aurora', name: 'AURORA CASINO CLUB', tag: '#AURORA', motto: 'Luck Favours the Patient', emblemIcon: 'nights_stay', totalWinnings: 98_000, memberCount: 4, maxMembers: 10, open: true, color: 'linear-gradient(135deg,#0a1e2a,#102838)' },
  ]);

  readonly roleGroups = ROLE_GROUPS;
  readonly createClubCost = CREATE_CLUB_COST;
  readonly chipsPerLevel = CHIPS_PER_LEVEL;

  readonly messages = computed(() => this._messages());

  readonly totalWinnings = computed(() => this._totalWinnings());

  readonly level = computed(() => computeLevel(this._totalWinnings()));

  readonly xpInLevel = computed(() => xpInCurrentLevel(this._totalWinnings()));

  readonly xpPercent = computed(() =>
    Math.round((this.xpInLevel() / CHIPS_PER_LEVEL) * 100)
  );

  readonly onlineCount = computed(() =>
    this.members.filter(m => m.status === 'online').length
  );

  readonly filteredMembers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q ? this.members.filter(m => m.name.toLowerCase().includes(q)) : this.members;
  });

  readonly topContributors = computed(() =>
    [...this.members].sort((a, b) => b.contribution - a.contribution).slice(0, 5)
  );

  readonly filteredPublicClubs = computed(() => {
    const q = this.exploreQuery().toLowerCase();
    return q
      ? this._publicClubs().filter(c =>
        c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q)
      )
      : this._publicClubs();
  });

  readonly canAffordCreate = computed(() => this.playerCoins() >= CREATE_CLUB_COST);

  readonly createFormValid = computed(() =>
    this.newClubName().trim().length >= 3 && this.newClubTag().trim().length >= 2
  );

  getMembersByRoles(roles: ReadonlyArray<ClubMember['role']>): ClubMember[] {
    return this.filteredMembers().filter(m => roles.includes(m.role));
  }

  formatCoins(n: number): string {
    return n >= 1_000 ? (n / 1_000).toFixed(1) + 'K' : n.toString();
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

  clubLevel(totalWinnings: number): number {
    return computeLevel(totalWinnings);
  }

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

  joinClub(club: PublicClub): void {
    this.showToast(`Request sent to join ${club.name}!`);
    this._publicClubs.update(clubs =>
      clubs.map(c => c.id === club.id ? { ...c, memberCount: c.memberCount + 1 } : c)
    );
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
    this.newClubName.set('');
    this.newClubTag.set('');
    this.newClubMotto.set('');
  }

  submitCreateClub(): void {
    if (!this.createFormValid() || !this.canAffordCreate()) return;

    const name = this.newClubName().trim().toUpperCase();
    const tag = this.newClubTag().trim().toUpperCase();

    this.playerCoins.update(c => c - CREATE_CLUB_COST);

    this._publicClubs.update(clubs => [{
      id: crypto.randomUUID(),
      name,
      tag: tag.startsWith('#') ? tag : '#' + tag,
      motto: this.newClubMotto().trim() || 'Fortune Favours the Bold',
      emblemIcon: 'workspace_premium',
      totalWinnings: 0,
      memberCount: 1,
      maxMembers: 10,
      open: true,
      color: 'linear-gradient(135deg,#1a1228,#261840)',
    }, ...clubs]);

    this.showCreateForm.set(false);
    this.showToast(`${name} created! ${this.formatCoins(CREATE_CLUB_COST)} chips spent.`);
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