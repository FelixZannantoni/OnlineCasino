import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type CosmeticType = 'avatar' | 'card-back' | 'chip';
type SvgFactory = (ctx: { uid: string; size: number; label: string }) => string;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const labelSvg = (label: string, fill = 'white', fontSize = 10): string =>
  label
    ? `<text x="40" y="44.5" text-anchor="middle" font-size="${fontSize}" font-weight="700" fill="${fill}" font-family="Arial,sans-serif">${escapeHtml(label)}</text>`
    : '';

const avatarSvg = (body: string, size: number): string =>
  `<svg class="cosmetic-svg avatar-ring" width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const cardBackSvg = (body: string): string =>
  `<svg class="cosmetic-svg card-back-svg" viewBox="0 0 63 88" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${body}</svg>`;

const chipSvg = (body: string, size: number): string =>
  `<svg class="cosmetic-svg chip-svg" width="${size}" height="${size}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const AVATAR_DESIGNS: Record<number, SvgFactory> = {
  1: ({ size }) => avatarSvg('<circle cx="60" cy="60" r="55" fill="none" stroke="#616161" stroke-width="4" />', size),
  2: ({ uid, size }) => avatarSvg(`
    <defs><linearGradient id="${uid}_g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ce93d8" /><stop offset="100%" stop-color="#6a0dad" /></linearGradient></defs>
    <circle cx="60" cy="60" r="57" fill="none" stroke="#ce93d8" stroke-width="1" opacity="0.25" />
    <circle cx="60" cy="60" r="53" fill="none" stroke="url(#${uid}_g)" stroke-width="7" />
    <circle cx="60" cy="60" r="46" fill="none" stroke="#9c27b0" stroke-width="1" opacity="0.4" stroke-dasharray="5 4" />
    <path d="M40,16 L48,30 L60,18 L72,30 L80,16 L83,34 L37,34 Z" fill="#ce93d8" />
    <rect x="37" y="33" width="46" height="6" rx="2.5" fill="#9c27b0" />
    <circle cx="48" cy="21" r="3" fill="white" opacity="0.85" /><circle cx="60" cy="15" r="3.5" fill="#ffd700" opacity="0.95" /><circle cx="72" cy="21" r="3" fill="white" opacity="0.85" />
  `, size),
  3: ({ uid, size }) => avatarSvg(`
    <defs><linearGradient id="${uid}_g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffd86e" /><stop offset="50%" stop-color="#ffd700" /><stop offset="100%" stop-color="#d19e1d" /></linearGradient><linearGradient id="${uid}_d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f7ff" /><stop offset="100%" stop-color="#64b5f6" /></linearGradient></defs>
    <circle cx="60" cy="60" r="57" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.25" />
    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#${uid}_g)" stroke-width="7" />
    <circle cx="60" cy="60" r="45" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.3" stroke-dasharray="4 4" />
    <polygon fill="url(#${uid}_d)" points="60,5 63,11 60,16 57,11" /><polygon fill="url(#${uid}_d)" points="115,60 109,63 104,60 109,57" /><polygon fill="url(#${uid}_d)" points="60,115 57,109 60,104 63,109" /><polygon fill="url(#${uid}_d)" points="5,60 11,57 16,60 11,63" />
    <polygon fill="url(#${uid}_d)" points="99,21 103,28 98,32 94,25" /><polygon fill="url(#${uid}_d)" points="99,99 95,96 98,88 103,92" /><polygon fill="url(#${uid}_d)" points="21,99 17,92 22,88 26,95" /><polygon fill="url(#${uid}_d)" points="21,21 25,17 28,24 24,28" />
  `, size),
  4: ({ uid, size }) => avatarSvg(`
    <defs><radialGradient id="${uid}_glow" cx="50%" cy="50%" r="55%"><stop offset="55%" stop-color="#ff6b6b" stop-opacity="0" /><stop offset="100%" stop-color="#ff6b6b" stop-opacity="0.2" /></radialGradient><linearGradient id="${uid}_g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff9f43" /><stop offset="100%" stop-color="#c92a2a" /></linearGradient></defs>
    <circle cx="60" cy="60" r="58" fill="url(#${uid}_glow)" />
    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#${uid}_g)" stroke-width="7" />
    <circle cx="60" cy="60" r="45" fill="none" stroke="#ff6b6b" stroke-width="1" opacity="0.35" stroke-dasharray="5 4" />
    <path d="M60,5 Q66,17 60,24 Q54,17 60,5Z" fill="#ff9f43" /><path d="M115,60 Q103,66 96,60 Q103,54 115,60Z" fill="#ff9f43" /><path d="M60,115 Q54,103 60,96 Q66,103 60,115Z" fill="#ff9f43" /><path d="M5,60 Q17,54 24,60 Q17,66 5,60Z" fill="#ff9f43" />
    <path d="M22,22 Q28,31 22,38 Q16,31 22,22Z" fill="#ff6b6b" opacity="0.6" /><path d="M98,22 Q92,31 98,38 Q104,31 98,22Z" fill="#ff6b6b" opacity="0.6" /><path d="M22,98 Q28,89 22,82 Q16,89 22,98Z" fill="#ff6b6b" opacity="0.6" /><path d="M98,98 Q92,89 98,82 Q104,89 98,98Z" fill="#ff6b6b" opacity="0.6" />
  `, size),
  5: ({ uid, size }) => avatarSvg(`
    <defs><linearGradient id="${uid}_g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#90caf9" /><stop offset="100%" stop-color="#0d47a1" /></linearGradient></defs>
    <circle cx="60" cy="60" r="57" fill="none" stroke="#64b5f6" stroke-width="1" opacity="0.2" />
    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#${uid}_g)" stroke-width="6" />
    <circle cx="60" cy="60" r="45" fill="none" stroke="#90caf9" stroke-width="1" opacity="0.3" stroke-dasharray="3 5" />
    <polygon points="60,5 63,16 60,23 57,16" fill="#b3e5fc" opacity="0.85" /><polygon points="109,33 101,40 95,37 101,28" fill="#b3e5fc" opacity="0.85" /><polygon points="109,87 101,80 101,74 109,81" fill="#b3e5fc" opacity="0.85" /><polygon points="60,115 57,104 60,97 63,104" fill="#b3e5fc" opacity="0.85" /><polygon points="11,87 19,80 25,83 19,92" fill="#b3e5fc" opacity="0.85" /><polygon points="11,33 19,40 19,46 11,39" fill="#b3e5fc" opacity="0.85" />
  `, size),
};

const CARD_BACK_DESIGNS: Record<number, SvgFactory> = {
  5: () => cardBackSvg(`
    <rect width="63" height="88" rx="6" fill="#8B0000" /><rect x="3.5" y="3.5" width="56" height="81" rx="4" fill="none" stroke="#ffd700" stroke-width="1.5" />
    <path d="M0,22 L22,0 M0,44 L44,0 M0,66 L63,3 M0,88 L63,25 M19,88 L63,44 M40,88 L63,65" stroke="#b00" stroke-width="1.3" opacity="0.55" />
    <path d="M22,88 L0,66 M44,88 L0,44 M63,88 L0,25 M63,66 L22,0 M63,44 L44,0" stroke="#b00" stroke-width="1.3" opacity="0.4" />
    <polygon points="31.5,30 39,44 31.5,58 24,44" fill="none" stroke="#ffd700" stroke-width="1.5" /><polygon points="31.5,36 36,44 31.5,52 27,44" fill="#ffd700" opacity="0.2" /><circle cx="31.5" cy="44" r="2.5" fill="#ffd700" opacity="0.5" />
  `),
  6: () => cardBackSvg(`
    <rect width="63" height="88" rx="6" fill="#0a1628" /><rect x="3.5" y="3.5" width="56" height="81" rx="4" fill="none" stroke="#4fc3f7" stroke-width="1.5" />
    <path d="M0,16 Q16,10 31.5,16 Q47,22 63,16 M0,27 Q16,21 31.5,27 Q47,33 63,27 M0,38 Q16,32 31.5,38 Q47,44 63,38 M0,49 Q16,43 31.5,49 Q47,55 63,49 M0,60 Q16,54 31.5,60 Q47,66 63,60 M0,71 Q16,65 31.5,71 Q47,77 63,71" fill="none" stroke="#4fc3f7" stroke-width="1.3" opacity="0.6" />
    <circle cx="31.5" cy="44" r="9" fill="none" stroke="#4fc3f7" stroke-width="1" opacity="0.5" /><path d="M31.5,35 L31.5,53 M22.5,44 L40.5,44" stroke="#4fc3f7" stroke-width="0.8" opacity="0.5" /><circle cx="31.5" cy="44" r="2.5" fill="#4fc3f7" opacity="0.4" />
  `),
  7: () => cardBackSvg(`
    <rect width="63" height="88" rx="6" fill="#0d0d0d" /><rect x="3" y="3" width="57" height="82" rx="5" fill="none" stroke="#ffd700" stroke-width="2" /><rect x="7.5" y="7.5" width="48" height="73" rx="3.5" fill="none" stroke="#ffd700" stroke-width="0.8" opacity="0.4" />
    <path d="M31.5,7.5 L31.5,80.5 M7.5,44 L55.5,44" stroke="#ffd700" stroke-width="0.6" opacity="0.25" />
    <path d="M7.5,7.5 Q18,7.5 18,18 M55.5,7.5 Q45,7.5 45,18 M7.5,80.5 Q18,80.5 18,70 M55.5,80.5 Q45,80.5 45,70" fill="none" stroke="#ffd700" stroke-width="1.5" opacity="0.85" />
    <polygon points="31.5,32 40.5,44 31.5,56 22.5,44" fill="none" stroke="#ffd700" stroke-width="1.5" /><polygon points="31.5,37 36.5,44 31.5,51 26.5,44" fill="#ffd700" opacity="0.18" /><circle cx="31.5" cy="44" r="3" fill="#ffd700" opacity="0.6" />
  `),
  8: () => cardBackSvg(`
    <rect width="63" height="88" rx="6" fill="#0a3d1f" /><rect x="3.5" y="3.5" width="56" height="81" rx="4" fill="none" stroke="#2ecc71" stroke-width="1.5" />
    <path d="M15.75,3.5 L15.75,84.5 M31.5,3.5 L31.5,84.5 M47.25,3.5 L47.25,84.5 M3.5,22 L59.5,22 M3.5,44 L59.5,44 M3.5,66 L59.5,66" stroke="#2ecc71" stroke-width="0.7" opacity="0.4" />
    <circle cx="31.5" cy="44" r="11" fill="none" stroke="#2ecc71" stroke-width="1.5" /><circle cx="31.5" cy="33" r="4.5" fill="none" stroke="#2ecc71" stroke-width="1" opacity="0.65" /><circle cx="31.5" cy="55" r="4.5" fill="none" stroke="#2ecc71" stroke-width="1" opacity="0.65" /><circle cx="20.5" cy="44" r="4.5" fill="none" stroke="#2ecc71" stroke-width="1" opacity="0.65" /><circle cx="42.5" cy="44" r="4.5" fill="none" stroke="#2ecc71" stroke-width="1" opacity="0.65" />
  `),
};

const CHIP_DESIGNS: Record<number, SvgFactory> = {
  9: ({ size, label }) => chipSvg(`
    <circle cx="40" cy="40" r="38" fill="#4a4a4a" /><circle cx="40" cy="40" r="38" fill="none" stroke="#888" stroke-width="4" />
    <path d="M40,40 L40,2 A38,38 0 0,1 72,21 Z M40,40 L72,59 A38,38 0 0,1 40,78 Z" fill="#e53935" opacity="0.95" />
    <path d="M40,40 L8,59 A38,38 0 0,1 40,2 Z M40,40 L40,78 A38,38 0 0,1 8,59 Z M40,40 L72,21 A38,38 0 0,1 72,59 Z" fill="#fff" opacity="0.9" />
    <circle cx="40" cy="40" r="31" fill="none" stroke="#888" stroke-width="1.5" stroke-dasharray="6 4" /><circle cx="40" cy="40" r="22" fill="#4a4a4a" /><circle cx="40" cy="40" r="22" fill="none" stroke="#777" stroke-width="1.5" /><circle cx="40" cy="40" r="14" fill="#3a3a3a" />${labelSvg(label)}
  `, size),
  10: ({ uid, size, label }) => chipSvg(`
    <defs><radialGradient id="${uid}_a" cx="38%" cy="35%" r="65%"><stop offset="0%" stop-color="#fff8dc" /><stop offset="30%" stop-color="#ffd86e" /><stop offset="70%" stop-color="#d19e1d" /><stop offset="100%" stop-color="#7d5a0a" /></radialGradient><radialGradient id="${uid}_b" cx="38%" cy="35%" r="65%"><stop offset="0%" stop-color="#ffd86e" /><stop offset="100%" stop-color="#8B6914" /></radialGradient></defs>
    <circle cx="40" cy="40" r="38" fill="url(#${uid}_a)" /><circle cx="40" cy="40" r="38" fill="none" stroke="#ffd700" stroke-width="4" /><circle cx="40" cy="40" r="32" fill="none" stroke="#ffd86e" stroke-width="2" stroke-dasharray="7 4" /><circle cx="40" cy="40" r="22" fill="url(#${uid}_b)" /><circle cx="40" cy="40" r="22" fill="none" stroke="#ffd700" stroke-width="2" /><circle cx="40" cy="40" r="14" fill="rgba(0,0,0,0.3)" /><circle cx="40" cy="40" r="8" fill="url(#${uid}_a)" />${labelSvg(label, '#5a3e00', 9)}
  `, size),
  11: ({ uid, size, label }) => chipSvg(`
    <defs><radialGradient id="${uid}_a" cx="38%" cy="32%" r="70%"><stop offset="0%" stop-color="#e0f7ff" /><stop offset="25%" stop-color="#b3e5fc" /><stop offset="55%" stop-color="#80deea" stop-opacity="0.85" /><stop offset="100%" stop-color="#00acc1" stop-opacity="0.4" /></radialGradient></defs>
    <circle cx="40" cy="40" r="38" fill="url(#${uid}_a)" /><circle cx="40" cy="40" r="38" fill="none" stroke="#b2ebf2" stroke-width="3.5" />
    <path d="M40,40 L40,2 A38,38 0 0,1 72,21 Z M40,40 L72,21 A38,38 0 0,1 72,59 Z M40,40 L72,59 A38,38 0 0,1 40,78 Z M40,40 L40,78 A38,38 0 0,1 8,59 Z M40,40 L8,59 A38,38 0 0,1 8,21 Z M40,40 L8,21 A38,38 0 0,1 40,2 Z" fill="#80d8ff" opacity="0.12" />
    <circle cx="40" cy="40" r="31" fill="none" stroke="#80deea" stroke-width="1" stroke-dasharray="5 4" opacity="0.6" /><circle cx="40" cy="40" r="21" fill="rgba(255,255,255,0.2)" /><circle cx="40" cy="40" r="21" fill="none" stroke="#b2ebf2" stroke-width="1.5" />${labelSvg(label, '#006064', 9)}
  `, size),
  12: ({ uid, size, label }) => chipSvg(`
    <defs><radialGradient id="${uid}_glow" cx="50%" cy="50%" r="54%"><stop offset="55%" stop-color="#00e5ff" stop-opacity="0" /><stop offset="100%" stop-color="#00e5ff" stop-opacity="0.3" /></radialGradient></defs>
    <circle cx="40" cy="40" r="39" fill="url(#${uid}_glow)" /><circle cx="40" cy="40" r="36" fill="#0d0d1a" /><circle cx="40" cy="40" r="36" fill="none" stroke="#00e5ff" stroke-width="4" /><circle cx="40" cy="40" r="30" fill="none" stroke="#00b0ff" stroke-width="1.5" stroke-dasharray="4 5" opacity="0.7" /><circle cx="40" cy="40" r="22" fill="#0a0a14" /><circle cx="40" cy="40" r="22" fill="none" stroke="#00e5ff" stroke-width="2" /><circle cx="40" cy="40" r="11" fill="#001f3f" /><circle cx="40" cy="40" r="11" fill="none" stroke="#00e5ff" stroke-width="1.5" /><circle cx="40" cy="40" r="6" fill="#00e5ff" opacity="0.65" />${labelSvg(label, '#00e5ff', 8)}
  `, size),
};

const DESIGNS: Record<CosmeticType, Record<number, SvgFactory>> = {
  avatar: AVATAR_DESIGNS,
  'card-back': CARD_BACK_DESIGNS,
  chip: CHIP_DESIGNS,
};

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
  @Input() type: CosmeticType = 'avatar';
 
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

  constructor(private sanitizer: DomSanitizer) {}

  get renderedSvg(): SafeHtml {
    const factory = DESIGNS[this.type][this.cosmeticId] ?? DESIGNS[this.type][this.defaultCosmeticId];
    return this.sanitizer.bypassSecurityTrustHtml(
      factory({ uid: this.uid, size: this.size, label: this.label })
    );
  }

  private get defaultCosmeticId(): number {
    if (this.type === 'card-back') return 5;
    if (this.type === 'chip') return 9;
    return 1;
  }
}
