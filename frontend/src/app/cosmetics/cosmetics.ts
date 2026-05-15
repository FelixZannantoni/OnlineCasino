import { Component, Input } from '@angular/core';

/**
 * Single drop-in cosmetic renderer. Pass `type` + `cosmeticId` and it renders the right design.
 *
 * Usage:
 *   <app-cosmetic type="avatar"    [cosmeticId]="player.equippedAvatarId"   [size]="64"/>
 *   <app-cosmetic type="card-back" [cosmeticId]="player.equippedCardBackId"/>
 *   <app-cosmetic type="chip"      [cosmeticId]="player.equippedChipId"      [size]="40" label="50"/>
 *
 * Avatar IDs:    1=Default  2=Royal  3=Diamond  4=Dragon  5=Shadow Wolf
 * Card-back IDs: 5=Classic Red  6=Midnight Blue  7=Gold Filigree  8=Emerald Grid
 * Chip IDs:      9=Classic Clay  10=Gold Plated  11=Crystal  12=Neon Pulse
 */

@Component({
  selector: 'app-cosmetics',
  imports: [],
  templateUrl: './cosmetics.html',
  styleUrl: './cosmetics.css',
})
export class Cosmetic {
  /** Which cosmetic category to render */
  @Input() type: 'avatar' | 'card-back' | 'chip' = 'avatar';
 
  /** ID of the equipped cosmetic — matches shop/inventory IDs */
  @Input() cosmeticId: number = 1;
 
  /** Size in px (avatar + chip only). Card backs fill their container via CSS. */
  @Input() size: number = 64;
 
  /** Optional value label in chip center e.g. "50", "100" */
  @Input() label: string = '';
 
  /** Unique ID suffix to avoid SVG gradient collisions when multiple instances render */
  get uid(): string {
    return `c_${this.type}_${this.cosmeticId}_${this.size}`;
  }
}