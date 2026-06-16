export interface Card {
    name: string;
    value: number;
    color: string;
    owner: string;
    visibility: 'player' | 'none' | 'all';
}

export interface BlackjackPlayer {
    id: string;
    username: string;
    displayname: string;
    balance: number;
    bet: number;
    cards: Card[];
    handValue: number;
    isDealer: boolean;
}

export interface BlackjackGameState {
    gameId: string;
    gameBalance: number;
    isRunning: boolean;
    phase: 'WAITING' | 'BETTING' | 'PLAYING' | 'DEALER_TURN' | 'FINISHED';
    currentPlayerId: string | null;
    turnEndsAt: number | null;
    turnRemainingSeconds: number | null;
    chipOptions?: { value: number; cls: string }[];
    players: BlackjackPlayer[];

    /**
     * Remaining seconds for the current player's turn.
     * Backend may omit this or set it to null when no timer is active.
     */
    turnRemainingSeconds?: number | null;

    bot: {
        id: string;
        cards: Card[];
        handValue: number;
    };
}
