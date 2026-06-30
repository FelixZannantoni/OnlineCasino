import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { DataService } from '../services/data-service';

interface ShopItem {
  id: number;
  type: 'avatar' | 'card-back' | 'chip' | 'table-felt';
  name: string;
  price: number;
  currency: 'credits' | 'free';
  icon: string;
  category: 'avatars' | 'card-backs' | 'chip-designs' | 'table-felts' | 'bundles';
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isOwned: boolean;
  previewColors?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [MatIconModule, DecimalPipe],
  templateUrl: './shop.html',
  styleUrls: ['./shop.css']
})
export class Shop implements OnInit {
  private readonly dataService = inject(DataService);

  selectedCategory: 'all' | 'avatars' | 'card-backs' | 'chip-designs' | 'table-felts' | 'bundles' = 'all';
  userCredits: number = 2450;

  featuredItem: ShopItem = {
    id: 0,
    type: 'avatar',
    name: 'High Roller Bundle',
    price: 4999,
    currency: 'credits',
    icon: 'diamond',
    category: 'bundles',
    description: 'Exclusive avatar + gold chip design + premium card backs',
    rarity: 'legendary',
    isOwned: false,
    isFeatured: true
  };

  items: ShopItem[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadShopItems();
  }

  get filteredItems(): ShopItem[] {
    if (this.selectedCategory === 'all') return this.items;
    return this.items.filter(item => item.category === this.selectedCategory);
  }

  categories = [
    { id: 'all' as const, label: 'All', icon: 'apps' },
    { id: 'avatars' as const, label: 'Avatars', icon: 'account_circle' },
    { id: 'card-backs' as const, label: 'Card Backs', icon: 'credit_card' },
    { id: 'chip-designs' as const, label: 'Chip Designs', icon: 'casino' },
    { id: 'table-felts' as const, label: 'Table Felts', icon: 'table_restaurant' },
    { id: 'bundles' as const, label: 'Bundles', icon: 'shopping_bag' }
  ];

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return '#a0a0a0';
      case 'rare': return '#4fc3f7';
      case 'epic': return '#ce93d8';
      case 'legendary': return '#ffd700';
      default: return '#fff';
    }
  }

  getFreeMoney(): void {
    this.userCredits += 1000;
    // TODO: run an ad before giving money;
  }

  async buy(item: ShopItem): Promise<void> {
    const userId = this.dataService.getUserId();
    if (!userId || item.isOwned || item.category === 'bundles') return;
    if (item.currency !== 'free' && this.userCredits < item.price) return;

    const response = await fetch('/cosmetics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        cosmeticId: item.id,
        cosmeticType: item.type,
      }),
    });

    if (!response.ok) return;

    item.isOwned = true;
    if (item.currency !== 'free') {
      this.userCredits -= item.price;
    }
  }

  private async loadShopItems(): Promise<void> {
    const userId = this.dataService.getUserId();
    if (!userId) return;

    const response = await fetch(`/cosmetics?userId=${encodeURIComponent(userId)}&includeUnowned=true`);
    if (!response.ok) return;

    this.items = (await response.json() as ShopItem[])
      .filter(item => item.price > 0)
      .map(item => ({
        ...item,
        currency: item.price === 0 ? 'free' : 'credits',
        isNew: item.rarity === 'legendary',
        isFeatured: item.rarity === 'legendary',
      }));

    const featured = this.items.find(item => item.isFeatured && !item.isOwned);
    if (featured) this.featuredItem = featured;
  }
}
