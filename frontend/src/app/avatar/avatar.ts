import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { getAvatarPalette, getInitials } from '../services/avatar-utils';

/**
 * Initials based avatar, used everywhere a profile picture would normally
 * go (navbar, profile overlay, table games, club, friends, ...). There are
 * no actual uploaded profile pictures yet, so this renders the player's
 * initials on a deterministic color instead of a broken <img>.
 */
@Component({
  selector: 'app-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  name = input<string | null | undefined>('');
  size = input<number>(40);

  readonly initials = computed(() => getInitials(this.name()));
  readonly palette = computed(() => getAvatarPalette(this.name()));
  readonly fontSize = computed(() => Math.round(this.size() * 0.4));
}
