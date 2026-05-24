import { Game } from "./game";
import { Player } from "./player";
import { CardGamePlayer } from "./cardGamePlayer";

export class CardGame<T extends CardGamePlayer = CardGamePlayer> extends Game<T> {
    protected turnTimer: NodeJS.Timeout | null = null;
    protected turnEndTime: number | null = null;
    protected defaultTurnTimeoutMs: number = 15000;

    constructor(gameId: string) {
        super(gameId);
    }

    public setDefaultDealerChip() {
        this.players[Math.floor(Math.random() * this.players.length)].setDealerChip(true);
    }

    protected updateDealerChip() {
        for (let i: number = 0; i < this.players.length; i++) {
            if (this.players[i].getDealerChip() == true) {
                this.players[i].setDealerChip(false);
                this.players[Player.nextPlayer(this.players, i)].setDealerChip(true);
                return;
            }
        }
    }

    protected startTurnTimer(timeoutMs?: number, onTimeout?: () => void) {
        this.stopTurnTimer();
        const timeout = timeoutMs || this.defaultTurnTimeoutMs;
        this.turnEndTime = Date.now() + timeout;
        
        if (onTimeout) {
            this.turnTimer = setTimeout(onTimeout, timeout);
        }
    }

    protected stopTurnTimer() {
        if (this.turnTimer) {
            clearTimeout(this.turnTimer);
            this.turnTimer = null;
        }
        this.turnEndTime = null;
    }

    protected getTurnRemainingSeconds(): number | null {
        if (!this.turnEndTime) return null;
        return Math.max(0, Math.round((this.turnEndTime - Date.now()) / 1000));
    }
}