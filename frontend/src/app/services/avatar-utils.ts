export interface AvatarPalette {
  background: string;
  color: string;
}

/**
 * Same palette style already used as demo data in club.ts (gold, green,
 * purple, orange, blue, red). Kept here once so every avatar in the app
 * (navbar, profile, table games, club, friends, ...) draws from the same
 * set of colors instead of redefining its own gradients.
 */
const AVATAR_PALETTES: AvatarPalette[] = [
  { background: 'linear-gradient(135deg,#1e1a10,#2a2210)', color: '#d4a017' }, // gold
  { background: 'linear-gradient(135deg,#0f1e1a,#122820)', color: '#1D9E75' }, // green
  { background: 'linear-gradient(135deg,#1a1228,#261840)', color: '#7F77DD' }, // purple
  { background: 'linear-gradient(135deg,#1e1510,#2a1e10)', color: '#EF9F27' }, // orange
  { background: 'linear-gradient(135deg,#141428,#1e1e34)', color: '#85B7EB' }, // blue
  { background: 'linear-gradient(135deg,#1e1818,#2a2020)', color: '#F09595' }, // red
];

const FALLBACK_PALETTE: AvatarPalette = { background: 'linear-gradient(135deg,#1e1e1e,#2a2a2a)', color: '#9aa0a6' };
const FALLBACK_INITIALS = '?';

/**
 * Small deterministic string hash (djb2 style). Same name always maps to
 * the same number, so a given user keeps the same avatar color every time
 * instead of it changing on every render.
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Derives initials from a display name.
 *   "VelvetAce"      -> "VA"   (camelCase boundary, same as club.ts demo data)
 *   "Night Dealer"   -> "ND"   (separate words)
 *   "ace"            -> "AC"   (plain fallback)
 */
export function getInitials(name: string | null | undefined): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return FALLBACK_INITIALS;

  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const capitals = trimmed.match(/[A-Z]/g);
  if (capitals && capitals.length >= 2) {
    return (capitals[0] + capitals[1]).toUpperCase();
  }

  if (trimmed.length >= 2) {
    return trimmed.slice(0, 2).toUpperCase();
  }

  return trimmed.toUpperCase();
}

/**
 * Picks a palette deterministically based on the name, so the same person
 * always gets the same avatar colors.
 */
export function getAvatarPalette(name: string | null | undefined): AvatarPalette {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return FALLBACK_PALETTE;
  return AVATAR_PALETTES[hashString(trimmed) % AVATAR_PALETTES.length];
}
