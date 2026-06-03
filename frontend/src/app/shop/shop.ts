import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { Router } from 'express';

interface ShopItem {
  id: number;
  name: string;
  price: number;
  currency: 'credits' | 'free';
  icon: string;
  category: 'avatars' | 'card-backs' | 'chip-designs' | 'bundles';
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
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
export class Shop {
  selectedCategory: 'all' | 'avatars' | 'card-backs' | 'chip-designs' | 'bundles' = 'all';
  userCredits: number = 2450;

  featuredItem: ShopItem = {
    id: 0,
    name: 'High Roller Bundle',
    price: 4999,
    currency: 'credits',
    icon: 'diamond',
    category: 'bundles',
    description: 'Exclusive avatar + gold chip design + premium card backs',
    rarity: 'legendary',
    isFeatured: true
  };

  items: ShopItem[] = [
    {
      id: 1,
      name: 'Royal Avatar',
      price: 500,
      currency: 'credits',
      icon: 'star', /* Use of a star icon to represent royalty, because "royalty" does not exist in MatIcons */
      category: 'avatars',
      description: 'Show your royal status at the poker table',
      rarity: 'epic',
      isNew: true
    },
    {
      id: 2,
      name: 'Diamond Avatar',
      price: 1000,
      currency: 'credits',
      icon: 'diamond',
      category: 'avatars',
      description: 'Sparkle with every hand you play',
      rarity: 'legendary'
    },
    {
      id: 3,
      name: 'Gold Chip Design',
      price: 750,
      currency: 'credits',
      icon: 'monetization_on',
      category: 'chip-designs',
      description: 'Premium gold-plated chip appearance',
      rarity: 'epic',
      isNew: true
    },
    {
      id: 4,
      name: 'Classic Red Card Back',
      price: 100,
      currency: 'credits',
      icon: 'credit_card',
      category: 'card-backs',
      description: 'Timeless classic poker card design',
      rarity: 'common'
    },
    {
      id: 5,
      name: 'Purple Dragon Avatar',
      price: 1500,
      currency: 'credits',
      icon: 'pets',
      category: 'avatars',
      description: 'Unleash the dragon at the table',
      rarity: 'legendary',
      isFeatured: true
    },
    {
      id: 6,
      name: 'Starter Bundle',
      price: 0,
      currency: 'free',
      icon: 'shopping_bag',
      category: 'bundles',
      description: 'Free bundle with basic cosmetics',
      rarity: 'common',
      isNew: true
    }
  ];

  get filteredItems(): ShopItem[] {
    if (this.selectedCategory === 'all') return this.items;
    return this.items.filter(item => item.category === this.selectedCategory);
  }

  categories = [
    { id: 'all' as const, label: 'All', icon: 'apps' },
    { id: 'avatars' as const, label: 'Avatars', icon: 'account_circle' },
    { id: 'card-backs' as const, label: 'Card Backs', icon: 'credit_card' },
    { id: 'chip-designs' as const, label: 'Chip Designs', icon: 'casino' },
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
}
