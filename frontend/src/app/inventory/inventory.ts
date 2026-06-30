import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../services/data-service';

export interface OwnedCosmetic {
  id: number;
  type: 'avatar' | 'card-back' | 'chip' | 'table-felt';
  name: string;
  description: string;
  icon: string;
  category: 'avatars' | 'card-backs' | 'chip-designs' | 'table-felts';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isOwned: boolean;
  isEquipped: boolean;
  previewColors?: string[];
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory {
  private readonly dataService = inject(DataService);

  selectedCategory: 'all' | 'avatars' | 'card-backs' | 'chip-designs' | 'table-felts' = 'all';

  categories = [
    { id: 'all' as const, label: 'All', icon: 'apps' },
    { id: 'avatars' as const, label: 'Avatars', icon: 'account_circle' },
    { id: 'card-backs' as const, label: 'Card Backs', icon: 'credit_card' },
    { id: 'chip-designs' as const, label: 'Chip Designs', icon: 'casino' },
    { id: 'table-felts' as const, label: 'Table Felts', icon: 'table_restaurant' },
  ];

  ownedItems: OwnedCosmetic[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadInventory();
  }

  get filteredItems(): OwnedCosmetic[] {
    if (this.selectedCategory === 'all') return this.ownedItems;
    return this.ownedItems.filter(item => item.category === this.selectedCategory);
  }

  get equippedItems(): OwnedCosmetic[] {
    return this.ownedItems.filter(i => i.isEquipped);
  }

  getEquipped(category: string): OwnedCosmetic | undefined {
    return this.ownedItems.find(i => i.category === category && i.isEquipped);
  }

  countByCategory(categoryId: string): number {
    if (categoryId === 'all') return this.ownedItems.length;
    return this.ownedItems.filter(i => i.category === categoryId).length;
  }

  async equip(item: OwnedCosmetic): Promise<void> {
    const userId = this.dataService.getUserId();
    if (!userId || item.isEquipped) return;

    const response = await fetch('/cosmetics/equip', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        cosmeticId: item.id,
        cosmeticType: item.type,
      }),
    });

    if (!response.ok) return;

    this.ownedItems
      .filter(i => i.category === item.category)
      .forEach(i => i.isEquipped = false);
    item.isEquipped = true;
  }

  rarityLabel(rarity: string): string {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }

  private async loadInventory(): Promise<void> {
    const userId = this.dataService.getUserId();
    if (!userId) return;

    const response = await fetch(`/cosmetics?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) return;

    this.ownedItems = await response.json() as OwnedCosmetic[];
  }
}
