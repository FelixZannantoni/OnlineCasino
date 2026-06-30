import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data-service';
import { ClubDetails, ClubService, ClubSummary, ClubUserDisplay } from './club.service';

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
  id: number;
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
export class Club implements OnInit {
  @ViewChild('chatContainer') private chatContainer?: ElementRef<HTMLElement>;

  private readonly clubService = inject(ClubService);
  private readonly dataService = inject(DataService);

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
  readonly loading = signal(false);

  private readonly _messages = signal<ClubMessage[]>([
    { memberId: 'golden', memberName: 'GoldenRush', memberInit: 'GR', memberColor: 'linear-gradient(135deg,#1e1a10,#2a2210)', memberHue: '#d4a017', mine: false, text: "Who's up for a poker run tonight?", time: '9:12 AM' },
    { memberId: 'night', memberName: 'NightDealer', memberInit: 'ND', memberColor: 'linear-gradient(135deg,#0f1e1a,#122820)', memberHue: '#1D9E75', mine: false, text: "I'm in. Let's push the vault past 200k this week!", time: '9:14 AM' },
    { memberId: 'me', memberName: 'You', memberInit: 'ME', memberColor: 'linear-gradient(135deg,#1a1228,#261840)', memberHue: '#7F77DD', mine: true, text: 'Absolutely. Blackjack table is calling my name.', time: '9:15 AM' },
    { memberId: 'blaze', memberName: 'BlazeMerchant', memberInit: 'BM', memberColor: 'linear-gradient(135deg,#1e1510,#2a1e10)', memberHue: '#EF9F27', mine: false, text: "I'll catch up later, gotta step out for a bit.", time: '9:22 AM' },
  ]);

  private readonly _totalWinnings = signal(184_200);

  club = {
    id: 0,
    name: 'NO CLUB',
    tag: '#VAULT',
    motto: 'Join or create a club',
    founded: 'March 2024',
  };

  readonly members = signal<ClubMember[]>([
    { id: 'velvet', name: 'VelvetAce', role: 'owner', status: 'online', activity: 'Playing Poker', color: 'linear-gradient(135deg,#1a1228,#261840)', init: 'VA', hue: '#7F77DD', contribution: 54200 },
    { id: 'golden', name: 'GoldenRush', role: 'officer', status: 'online', activity: 'Playing Blackjack', color: 'linear-gradient(135deg,#1e1a10,#2a2210)', init: 'GR', hue: '#d4a017', contribution: 38900 },
    { id: 'night', name: 'NightDealer', role: 'officer', status: 'online', activity: 'In Lobby', color: 'linear-gradient(135deg,#0f1e1a,#122820)', init: 'ND', hue: '#1D9E75', contribution: 32100 },
    { id: 'blaze', name: 'BlazeMerchant', role: 'member', status: 'away', activity: 'Away', color: 'linear-gradient(135deg,#1e1510,#2a1e10)', init: 'BM', hue: '#EF9F27', contribution: 21700 },
    { id: 'steel', name: 'SteelBluff', role: 'member', status: 'offline', activity: 'Last seen 2h ago', color: 'linear-gradient(135deg,#141428,#1e1e34)', init: 'SB', hue: '#85B7EB', contribution: 19400 },
    { id: 'dusk', name: 'DuskCroupier', role: 'member', status: 'offline', activity: 'Last seen yesterday', color: 'linear-gradient(135deg,#1e1818,#2a2020)', init: 'DC', hue: '#F09595', contribution: 17900 },
  ]);

  private readonly _publicClubs = signal<PublicClub[]>([
    { id: 1, name: 'ROYAL FLUSH SOCIETY', tag: '#ROYAL', motto: 'All In, Always', emblemIcon: 'diamond', totalWinnings: 320_000, memberCount: 12, maxMembers: 20, open: true, color: 'linear-gradient(135deg,#1a0e2a,#2a1840)' },
    { id: 2, name: 'IRON DEALER GUILD', tag: '#IRON', motto: 'Steel Nerves Win Tables', emblemIcon: 'shield', totalWinnings: 215_000, memberCount: 8, maxMembers: 15, open: true, color: 'linear-gradient(135deg,#141e28,#1a2a38)' },
    { id: 3, name: 'SHADOW SYNDICATE', tag: '#SHAD', motto: 'The Dark Horse Wins', emblemIcon: 'visibility_off', totalWinnings: 178_000, memberCount: 6, maxMembers: 10, open: false, color: 'linear-gradient(135deg,#0e0e1a,#181828)' },
    { id: 4, name: 'BLAZE POKER HOUSE', tag: '#BLAZE', motto: 'Play Hot, Win Hotter', emblemIcon: 'local_fire_department', totalWinnings: 143_000, memberCount: 9, maxMembers: 15, open: true, color: 'linear-gradient(135deg,#2a1008,#381808)' },
    { id: 5, name: 'AURORA CASINO CLUB', tag: '#AURORA', motto: 'Luck Favours the Patient', emblemIcon: 'nights_stay', totalWinnings: 98_000, memberCount: 4, maxMembers: 10, open: true, color: 'linear-gradient(135deg,#0a1e2a,#102838)' },
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
    this.members().filter(m => m.status === 'online').length
  );

  readonly filteredMembers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return q ? this.members().filter(m => m.name.toLowerCase().includes(q)) : this.members();
  });

  readonly topContributors = computed(() =>
    [...this.members()].sort((a, b) => b.contribution - a.contribution).slice(0, 5)
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

  async ngOnInit(): Promise<void> {
    await this.loadClubPage();
  }

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

  async joinClub(club: PublicClub): Promise<void> {
    const userId = this.dataService.getUserId();

    if (!userId) {
      this.showToast('Please log in before joining a club.');
      return;
    }

    if (club.memberCount >= club.maxMembers) return;

    try {
      const joinedClub = await this.clubService.joinClub(userId, club.id);
      this.applyClub(joinedClub);
      await this.loadPublicClubs();
      this.switchTab('members');
      this.showToast(`Joined ${club.name}!`);
    } catch {
      this.showToast(`Could not join ${club.name}.`);
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
    this.newClubName.set('');
    this.newClubTag.set('');
    this.newClubMotto.set('');
  }

  async submitCreateClub(): Promise<void> {
    if (!this.createFormValid() || !this.canAffordCreate()) return;

    const name = this.newClubName().trim().toUpperCase();
    const userId = this.dataService.getUserId();

    if (!userId) {
      this.showToast('Please log in before creating a club.');
      return;
    }

    try {
      const createdClub = await this.clubService.createClub(userId, name);
      this.playerCoins.update(c => c - CREATE_CLUB_COST);
      this.applyClub(createdClub);
      await this.loadPublicClubs();
      this.showCreateForm.set(false);
      this.switchTab('members');
      this.showToast(`${name} created! ${this.formatCoins(CREATE_CLUB_COST)} chips spent.`);
    } catch {
      this.showToast(`Could not create ${name}.`);
    }
  }

  private async loadClubPage(): Promise<void> {
    this.loading.set(true);

    try {
      await Promise.all([
        this.loadMyClub(),
        this.loadPublicClubs(),
        this.loadPlayerBalance(),
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadMyClub(): Promise<void> {
    const userId = this.dataService.getUserId();
    if (!userId) {
      this.members.set([]);
      this.activeTab.set('explore');
      return;
    }

    try {
      const club = await this.clubService.getMyClub(userId);
      if (club) {
        this.applyClub(club);
      } else {
        this.members.set([]);
        this.activeTab.set('explore');
      }
    } catch {
      this.showToast('Could not load your club.');
    }
  }

  private async loadPublicClubs(): Promise<void> {
    try {
      const clubs = await this.clubService.getClubs();
      this._publicClubs.set(clubs.map((club, index) => this.toPublicClub(club, index)));
    } catch {
      this.showToast('Could not load available clubs.');
    }
  }

  private async loadPlayerBalance(): Promise<void> {
    const userId = this.dataService.getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`/users/${userId}`);
      if (!response.ok) return;
      const user = await response.json() as { balance?: number };
      if (typeof user.balance === 'number') {
        this.playerCoins.set(user.balance);
      }
    } catch {
      // Balance is only used for the create button; keep the default on failure.
    }
  }

  private applyClub(club: ClubDetails): void {
    this.club = {
      id: club.id,
      name: club.name.toUpperCase(),
      tag: this.makeTag(club.name),
      motto: this.newClubMotto().trim() || 'Fortune Favours the Bold',
      founded: 'Today',
    };
    this.members.set(club.members.map((member, index) => this.toClubMember(member, index)));
    this._totalWinnings.set(this.members().reduce((sum, member) => sum + member.contribution, 0));
  }

  private toClubMember(member: ClubUserDisplay, index: number): ClubMember {
    const palette = this.memberPalette(index);
    const name = member.displayname || member.username || 'Player';

    return {
      id: member.uuid,
      name,
      role: index === 0 ? 'owner' : 'member',
      status: this.toMemberStatus(member.status),
      activity: member.status === 'online' ? 'In Lobby' : 'Offline',
      color: palette.color,
      hue: palette.hue,
      init: this.initials(name),
      contribution: 0,
    };
  }

  private toPublicClub(club: ClubSummary, index: number): PublicClub {
    const palette = this.clubPalette(index);

    return {
      id: club.id,
      name: club.name.toUpperCase(),
      tag: this.makeTag(club.name),
      motto: 'Fortune Favours the Bold',
      emblemIcon: this.clubIcon(index),
      totalWinnings: club.totalBalance,
      memberCount: club.memberCount,
      maxMembers: 20,
      open: true,
      color: palette,
    };
  }

  private toMemberStatus(status: string): ClubMember['status'] {
    if (status === 'online' || status === 'away' || status === 'offline') return status;
    return 'offline';
  }

  private initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || '??';
  }

  private makeTag(name: string): string {
    const tag = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
    return `#${tag || 'CLUB'}`;
  }

  private memberPalette(index: number): { color: string; hue: string } {
    const palettes = [
      { color: 'linear-gradient(135deg,#1a1228,#261840)', hue: '#7F77DD' },
      { color: 'linear-gradient(135deg,#1e1a10,#2a2210)', hue: '#d4a017' },
      { color: 'linear-gradient(135deg,#0f1e1a,#122820)', hue: '#1D9E75' },
      { color: 'linear-gradient(135deg,#1e1510,#2a1e10)', hue: '#EF9F27' },
      { color: 'linear-gradient(135deg,#141428,#1e1e34)', hue: '#85B7EB' },
      { color: 'linear-gradient(135deg,#1e1818,#2a2020)', hue: '#F09595' },
    ];

    return palettes[index % palettes.length];
  }

  private clubPalette(index: number): string {
    const palettes = [
      'linear-gradient(135deg,#1a0e2a,#2a1840)',
      'linear-gradient(135deg,#141e28,#1a2a38)',
      'linear-gradient(135deg,#0e0e1a,#181828)',
      'linear-gradient(135deg,#2a1008,#381808)',
      'linear-gradient(135deg,#0a1e2a,#102838)',
    ];

    return palettes[index % palettes.length];
  }

  private clubIcon(index: number): string {
    const icons = ['diamond', 'shield', 'workspace_premium', 'local_fire_department', 'nights_stay'];
    return icons[index % icons.length];
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
