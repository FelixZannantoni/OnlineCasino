import { Component, ViewChild, ElementRef, AfterViewChecked, WritableSignal, signal, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data-service';
import { SocketService } from '../services/socket.service';

interface Friend {
  uuid: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  activity: string;
  color: string;
  hue: string;
  init: string;
}

interface Message {
  mine: boolean;
  otherId: string;
  text: string;
  time: string;
}

interface PendingRequest {
  id: string;
  fromUuid: string;
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
  standalone: true,
  imports: [FormsModule],
  templateUrl: './friends.html',
  styleUrls: ['./friends.css'],
})
export class Friends implements AfterViewChecked, OnInit {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  activeTab: 'friends' | 'add' = 'friends';
  activeFriend: Friend | null = null;
  searchQuery = '';
  messageInput = '';
  addInput = '';
  toastHidden: WritableSignal<boolean> = signal(true);
  toastMessage = '';
  private toastTimer: any;
  private shouldScroll = false;

  private dataService: DataService = inject(DataService);
  private socketService: SocketService = inject(SocketService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  sections = [
    { label: 'Online', status: 'online' },
    { label: 'Away', status: 'away' },
    { label: 'Offline', status: 'offline' },
  ];

  pendingRequests: WritableSignal<PendingRequest[]> = signal([]);
  friends: WritableSignal<Friend[]> = signal([]); 

  filteredFriends: WritableSignal<Friend[]> = signal([]);

  private convos: Record<string, Message[]> = {};

  get onlineCount(): number {
    return this.friends().filter(f => f.status === 'online').length;
  }

  getSectionFriends(status: string): Friend[] {
    return this.filteredFriends().filter(f => f.status === status);
  }

  getMessages(): Message[] {
    return this.activeFriend ? (this.convos[this.activeFriend.uuid] ?? []) : [];
  }

  filterFriends(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredFriends.set(this.friends().filter(f => f.name.toLowerCase().includes(q)));
  }

  async switchTab(tab: 'friends' | 'add'): Promise<void> {
    this.activeTab = tab;

    await this.pendingRequests.set(await this.loadPendingRequests());
    await this.friends.set(await this.loadFriends());
    this.filteredFriends.set([...this.friends()]);

    // clear convos
    this.convos = {};
    const messages = await this.loadMessages();
    messages.forEach(m => {
      const otherId = m.otherId;
      if (!this.convos[otherId]) this.convos[otherId] = [];
      this.convos[otherId].push(m);
    });

    this.closeChat();
  }

  openChat(f: Friend): void {
    this.activeFriend = f;
    if (!this.convos[f.uuid]) this.convos[f.uuid] = [];
    this.shouldScroll = true;
  }

  closeChat(): void {
    this.activeFriend = null;
  }

  async sendMsg(): Promise<void> {
    if (!this.messageInput.trim() || !this.activeFriend) return;

    const response = await fetch('http://localhost:3000/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: this.dataService.userId(),
        receiverId: this.activeFriend?.uuid,
        content: this.messageInput.trim()
      })
    });

    if(response.ok) {
      this.convos[this.activeFriend.uuid].push({ mine: true, text: this.messageInput.trim(), time: this.nowTime(), otherId: this.activeFriend.uuid });
      this.messageInput = '';
      this.shouldScroll = true;
      this.cdr.markForCheck();
    }
  }

  sendInvite(): void {
    if (this.activeFriend) this.showToast(`${this.activeFriend.name} has been invited to your table`);
  }

  inviteFriend(name: string): void {
    this.showToast(`${name} has been invited to your table`);
  }

  async removeFriend(id: string): Promise<void> {
    const response = await fetch('http://localhost:3000/users/friends', { //TODO:  Wenn wir das in Main mergen, 'http://localhost:3000' löschen -> '/users/friends'
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: this.dataService.userId(),
        friendId: id
      })
    });

    if(response.ok) {
      this.friends.update(old => old.filter(f => f.uuid !== id));
    this.filteredFriends.update(old => old.filter(f => f.uuid !== id));
    if (this.activeFriend?.uuid === id) this.activeFriend = null;
    }
  }

  async sendFriendReq(): Promise<void> {
    const name = this.addInput.trim();
    if (!name) return;

    const response = await fetch('http://localhost:3000/users/friends', { //TODO:  Wenn wir das in Main mergen, 'http://localhost:3000' löschen -> '/users/friends'
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: this.dataService.userId(),
        toUsername: name
      })
    }); 

    if(response.ok) {
      this.pendingRequests().push({
      id: 'req-' + Date.now(),
      fromUuid: (await response.json()).uuid,
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

    
  }

  async loadPendingRequests(): Promise<PendingRequest[]> {
    const result: PendingRequest[] = [];

    const response = await fetch(`http://localhost:3000/users/${this.dataService.userId()}/friends/pending`, { //TODO:  Wenn wir das in Main mergen, 'http://localhost:3000' löschen -> '/userId/users/friends/pending'
      method: 'GET'
    });

    if (response.ok) {
      const requests: {senderId: string, senderName: string, receiverId: string, receiverName: string}[] = (await response.json()).requests;

      requests.forEach(request => {
        if(request.senderId === this.dataService.userId()) {
          // request ist von mir ausgehend
          result.push({ 
            id: `req-${request.senderName}-${request.receiverName}`, 
            fromUuid: request.senderId,
            name: request.receiverName,
            init: request.receiverName[0].toUpperCase(), 
            color: 'linear-gradient(135deg,#1a1228,#261840)', 
            hue: '#D4537E', 
            statusDot: 'offline', 
            label: 'Request sent — awaiting response', 
            incoming: false });
        } else {
          // der request geht an mich
          result.push({
            id: `req-${request.senderName}-${request.receiverName}`,
            fromUuid: request.senderId,
            name: request.senderName,
            init: request.senderName[0].toUpperCase(),
            color: 'linear-gradient(135deg,#1e1018,#281220)',
            hue: '#D4537E',
            statusDot: 'offline',
            label: 'Wants to be your friend',
            incoming: true
          });
        }
      });
    }

    return result;
  }

  async loadFriends(): Promise<Friend[]> {
    const result: Friend[] = [];

    const response = await fetch(`http://localhost:3000/users/${this.dataService.userId()}/friends`, { //TODO Wenn wir das in Main mergen, 'http://localhost:3000' löschen -> '/users/userId/friends'
      method: 'GET'
    });

    if (response.ok) {
      const friends: {uuid: string, username: string, displayname: string}[] = (await response.json()).friends;

      friends.forEach(f => {
        console.log(f);
        const randomHue = Math.floor(Math.random() * 360);
        result.push({
          uuid: f.uuid,
          name: f.displayname,
          status: 'offline',
          activity: 'Last seen yesterday',
          color: 'linear-gradient(135deg,#1a1228,#261840)',
          hue: `hsl(${randomHue}, 70%, 50%)`,
          init: f.displayname[0].toUpperCase()
        });
      });
    }

    return result;
  }

  async loadMessages(): Promise<Message[]> {
    const result: Message[] = [];

    const response = await fetch(`http://localhost:3000/chats?userId=${this.dataService.userId()}`, { //TODO:  Wenn wir das in Main mergen, 'http://localhost:3000' löschen -> '/chats?userId=xxx'
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if(response.ok) {
      const messages: { senderId: string, receiverId: string, content: string, timestamp: string }[] = (await response.json()).messages;

      messages.forEach(m => {
        const isMine = m.senderId === this.dataService.userId();
        result.push({
          mine: isMine,
          text: m.content,
          time: m.timestamp,
          otherId: isMine ? m.receiverId : m.senderId
        });
      });
    }

    return result;
  }

  async acceptReq(req: PendingRequest): Promise<void> {
    const response = await fetch('http://localhost:3000/users/friends/accept', { //TODO:  Wenn wir das in Main mergen, 'http://localhost:3000' löschen -> '/users/friends/accept'
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: this.dataService.userId(),
        fromUserId: req.fromUuid
      })
    });

    if(response.ok) {
      this.pendingRequests.set(this.pendingRequests().filter(r => r.id !== req.id));
      this.showToast(`${req.name} joined your fellowship!`);
    }
  }

  async declineReq(req: PendingRequest): Promise<void> {
    const response = await fetch('http://localhost:3000/users/friends', { //TODO:  Wenn wir das in Main mergen, 'http://localhost:3000' löschen -> '/users/friends'
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: this.dataService.userId(),
        friendId: req.fromUuid
      })
    });

    if(response.ok) {
      this.pendingRequests.set(this.pendingRequests().filter(r => r.id !== req.id));
    }
  }

  async ngOnInit(): Promise<void> {
    this.socketService.register(this.dataService.userId());

    this.socketService.onNewMessage(async () => {
      const messages = await this.loadMessages();
      this.convos = {};

      messages.forEach(m => {
        const otherId = m.otherId;
        if (!this.convos[otherId]) this.convos[otherId] = [];
        this.convos[otherId].push(m);
      });
      this.cdr.markForCheck();
    });

    await this.switchTab('friends');
  }

  async ngAfterViewChecked(): Promise<void> {
    if (this.shouldScroll && this.messageContainer) {
      const el = this.messageContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    this.toastHidden.set(false);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastHidden.set(true), 3200);
  }

  private nowTime(): string {
    const now = new Date();
    const h = now.getHours(), m = (now.getMinutes() + '').padStart(2, '0');
    return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  }
}