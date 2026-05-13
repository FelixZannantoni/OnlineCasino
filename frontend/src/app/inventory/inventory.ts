import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

export interface OwnedCosmetic {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'avatars' | 'card-backs' | 'chip-designs' | 'table-felts';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isEquipped?: boolean;
  previewColors?: string[];
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [MatIconModule, NgClass],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory {
  selectedCategory: 'all' | 'avatars' | 'card-backs' | 'chip-designs' | 'table-felts' = 'all';

  categories = [
    { id: 'all' as const, label: 'All', icon: 'apps' },
    { id: 'avatars' as const, label: 'Avatars', icon: 'account_circle' },
    { id: 'card-backs' as const, label: 'Card Backs', icon: 'credit_card' },
    { id: 'chip-designs' as const, label: 'Chip Designs', icon: 'casino' },
    { id: 'table-felts' as const, label: 'Table Felts', icon: 'table_restaurant' },
  ];

  ownedItems: OwnedCosmetic[] = [
    // Avatars
    {
      id: 1,
      name: 'Royal Avatar',
      description: 'Show your royal status at the poker table',
      icon: 'star',
      category: 'avatars',
      rarity: 'epic',
      isEquipped: true,
      previewColors: ['#ce93d8', '#9c27b0']
    },
    {
      id: 2,
      name: 'Diamond Avatar',
      description: 'Sparkle with every hand you play',
      icon: 'diamond',
      category: 'avatars',
      rarity: 'legendary',
      previewColors: ['#ffd700', '#e3a812']
    },
    {
      id: 3,
      name: 'Purple Dragon Avatar',
      description: 'Unleash the dragon at the table',
      icon: 'pets',
      category: 'avatars',
      rarity: 'legendary',
      previewColors: ['#ff6b6b', '#c92a2a']
    },
    {
      id: 4,
      name: 'Default Avatar',
      description: 'A clean, classic look',
      icon: 'person',
      category: 'avatars',
      rarity: 'common',
      previewColors: ['#9e9e9e', '#616161']
    },
    // Card Backs
    {
      id: 5,
      name: 'Classic Red Card Back',
      description: 'Timeless classic poker card design',
      icon: 'credit_card',
      category: 'card-backs',
      rarity: 'common',
      isEquipped: true,
      previewColors: ['#c0392b', '#922b21']
    },
    {
      id: 6,
      name: 'Midnight Blue Card',
      description: 'Elegant deep-sea blue finish',
      icon: 'style',
      category: 'card-backs',
      rarity: 'rare',
      previewColors: ['#1565c0', '#0d47a1']
    },
    {
      id: 7,
      name: 'Gold Foil Card',
      description: 'Luxurious golden shimmer on every card',
      icon: 'auto_awesome',
      category: 'card-backs',
      rarity: 'epic',
      previewColors: ['#ffd700', '#e3a812']
    },
    // Chip Designs
    {
      id: 8,
      name: 'Classic Casino Chip',
      description: 'The original casino feel',
      icon: 'casino',
      category: 'chip-designs',
      rarity: 'common',
      isEquipped: true,
      previewColors: ['#9e9e9e', '#616161']
    },
    {
      id: 9,
      name: 'Gold Chip Design',
      description: 'Premium gold-plated chip appearance',
      icon: 'monetization_on',
      category: 'chip-designs',
      rarity: 'epic',
      previewColors: ['#ffd700', '#e3a812']
    },
    // Table Felts
    {
      id: 10,
      name: 'Classic Green Felt',
      description: 'The timeless casino table look',
      icon: 'table_restaurant',
      category: 'table-felts',
      rarity: 'common',
      isEquipped: true,
      previewColors: ['#1b5e20', '#2e7d32']
    },
    {
      id: 11,
      name: 'Midnight Black Felt',
      description: 'Sleek all-black tournament table',
      icon: 'table_restaurant',
      category: 'table-felts',
      rarity: 'rare',
      previewColors: ['#212121', '#424242']
    },
  ];

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

  equip(item: OwnedCosmetic): void {
    this.ownedItems
      .filter(i => i.category === item.category)
      .forEach(i => i.isEquipped = false);
    item.isEquipped = true;
  }

  rarityLabel(rarity: string): string {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }
}