import { Component } from '@angular/core';

/**
 * Legacy component (nicht über die aktuelle Route `/poker` verwendet).
 * Der Router nutzt `frontend/src/app/table-game/poker/poker.ts`.
 *
 * Wir halten diese Datei nur build-fähig und konfliktfrei.
 */
@Component({
  selector: 'app-poker',
  standalone: true,
  template: `<p style="padding: 16px; color: #fff; background: rgba(0,0,0,0.5); border-radius: 8px;">
    Poker UI is served via /poker (table-game).
  </p>`,
})
export class Poker {
  // Intentionally empty
}
