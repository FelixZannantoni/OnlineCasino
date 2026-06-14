export interface Card {
    suit: string;
    rank: string;
    value: number;
    visibility: 'hidden' | 'visible' | 'all';
    owner: string;
}

export interface PokerPlayer {
    playerId: string;
    username: string;
    displayName: string;
    balance: number;
    cards: Card[];
    bet: number;
    hasDealerChip: boolean;
    handValue?: number[];
    // Actions
    pressedFold: boolean;
    pressedCheck: boolean;
    pressedBet: boolean;
    pressedCall: boolean;
    desiredBet: number;
}

export interface PokerGameState {
    gameId: string;
    gameBalance: number;
    players: PokerPlayer[];
    boardCards: Card[];
    pot: number;
    currentBet: number;
    phase: 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown' | 'preflop';
    lastWinners?: { id: string, handName: string }[];
    turnRemainingSeconds?: number | null;
}
