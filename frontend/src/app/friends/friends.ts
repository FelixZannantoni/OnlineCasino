import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Friend {
  id: string;
  name: string;
  tag: string;
  status: 'online' | 'away' | 'offline';
  activity: string;
  color: string;
  hue: string;
  init: string;
}

interface Message {
  mine: boolean;
  text: string;
  time: string;
}

interface PendingRequest {
  id: string;
  name: string;
  init: string;
  color: string;
  hue: string;
  statusDot: string;
  label: string;
  incoming: boolean;
}

@Component({
  selector: 'app-friends',
  imports: [FormsModule],
  templateUrl: './friends.html',
  styleUrl: './friends.css',
})
export class Friends implements AfterViewChecked {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  activeTab: 'friends' | 'add' = 'friends';
  activeFriend: Friend | null = null;
  searchQuery = '';
  messageInput = '';
  addInput = '';
  toastVisible = false;
  toastMessage = '';
  private toastTimer: any;
  private shouldScroll = false;

  sections = [
    { label: 'Online', status: 'online' },
    { label: 'Away', status: 'away' },
    { label: 'Offline', status: 'offline' },
  ];

  friends: Friend[] = [
    { id: 'velvet', name: 'VelvetAce', tag: '#1337', status: 'online', activity: 'Playing Poker', color: 'linear-gradient(135deg,#1a1228,#261840)', init: 'VA', hue: '#7F77DD' },
    { id: 'golden', name: 'GoldenRush', tag: '#8821', status: 'online', activity: 'Playing Blackjack', color: 'linear-gradient(135deg,#1e1a10,#2a2210)', init: 'GR', hue: '#d4a017' },
    { id: 'night', name: 'NightDealer', tag: '#5503', status: 'online', activity: 'In Lobby', color: 'linear-gradient(135deg,#0f1e1a,#122820)', init: 'ND', hue: '#1D9E75' },
    { id: 'rouge', name: 'RougeReine', tag: '#2214', status: 'online', activity: 'Playing Slots', color: 'linear-gradient(135deg,#1e1018,#281220)', init: 'RR', hue: '#D4537E' },
    { id: 'blaze', name: 'BlazeMerchant', tag: '#9900', status: 'away', activity: 'Away', color: 'linear-gradient(135deg,#1e1510,#2a1e10)', init: 'BM', hue: '#EF9F27' },
    { id: 'steel', name: 'SteelBluff', tag: '#4412', status: 'offline', activity: 'Last seen 2h ago', color: 'linear-gradient(135deg,#141428,#1e1e34)', init: 'SB', hue: '#85B7EB' },
    { id: 'dusk', name: 'DuskCroupier', tag: '#7731', status: 'offline', activity: 'Last seen yesterday', color: 'linear-gradient(135deg,#1e1818,#2a2020)', init: 'DC', hue: '#F09595' },
  ];

  filteredFriends: Friend[] = [...this.friends];

  pendingRequests: PendingRequest[] = [
    { id: 'req-shadow', name: 'ShadowKing#0042', init: 'SK', color: 'linear-gradient(135deg,#1e1018,#281220)', hue: '#D4537E', statusDot: 'online', label: 'Wants to join your circle', incoming: true },
  ];

  private convos: Record<string, Message[]> = {};

  get onlineCount(): number {
    return this.friends.filter(f => f.status === 'online').length;
  }

  getSectionFriends(status: string): Friend[] {
    return this.filteredFriends.filter(f => f.status === status);
  }

  getMessages(): Message[] {
    return this.activeFriend ? (this.convos[this.activeFriend.id] ?? []) : [];
  }

  filterFriends(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredFriends = this.friends.filter(f => f.name.toLowerCase().includes(q));
  }

  switchTab(tab: 'friends' | 'add'): void {
    this.activeTab = tab;
  }

  openChat(f: Friend): void {
    this.activeFriend = f;
    if (!this.convos[f.id]) this.convos[f.id] = [];
    this.shouldScroll = true;
  }

  closeChat(): void {
    this.activeFriend = null;
  }

  sendMsg(): void {
    const txt = this.messageInput.trim();
    if (!txt || !this.activeFriend) return;
    this.convos[this.activeFriend.id].push({ mine: true, text: txt, time: this.nowTime() });
    this.messageInput = '';
    this.shouldScroll = true;
  }

  sendInvite(): void {
    if (this.activeFriend) this.showToast(`${this.activeFriend.name} has been invited to your table`);
  }

  inviteFriend(name: string): void {
    this.showToast(`${name} has been invited to your table`);
  }

  removeFriend(id: string): void {
    this.friends = this.friends.filter(f => f.id !== id);
    this.filteredFriends = this.filteredFriends.filter(f => f.id !== id);
    if (this.activeFriend?.id === id) this.activeFriend = null;
  }

  sendFriendReq(): void {
    const name = this.addInput.trim();
    if (!name) return;
    this.pendingRequests.push({
      id: 'req-' + Date.now(),
      name,
      init: name[0].toUpperCase(),
      color: 'linear-gradient(135deg,#1a1228,#261840)',
      hue: '#7F77DD',
      statusDot: 'offline',
      label: 'Request sent — awaiting response',
      incoming: false,
    });
    this.addInput = '';
    this.showToast(`${name} — request dispatched`);
  }

  acceptReq(req: PendingRequest): void {
    this.pendingRequests = this.pendingRequests.filter(r => r.id !== req.id);
    this.showToast(`${req.name} joined your fellowship!`);
  }

  declineReq(req: PendingRequest): void {
    this.pendingRequests = this.pendingRequests.filter(r => r.id !== req.id);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.messageContainer) {
      const el = this.messageContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3200);
  }

  private nowTime(): string {
    const now = new Date();
    const h = now.getHours(), m = (now.getMinutes() + '').padStart(2, '0');
    return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  }
}