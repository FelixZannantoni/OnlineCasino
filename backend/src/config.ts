export interface ChipOption {
    value: number;
    cls: string;
}

export enum GameMode {
    LOW = "LOW",
    MIDDLE = "MIDDLE",
    HIGH = "HIGH"
}

export const LOW_CHIPS: ChipOption[] = [
    { value: 1, cls: 'ch1' },
    { value: 5, cls: 'ch5' },
    { value: 25, cls: 'ch25' },
    { value: 100, cls: 'ch100' },
    { value: 500, cls: 'ch500' },
];

export const MIDDLE_CHIPS: ChipOption[] = [
    { value: 10, cls: 'ch10' },
    { value: 50, cls: 'ch50' },
    { value: 250, cls: 'ch250' },
    { value: 1000, cls: 'ch1000' },
    { value: 5000, cls: 'ch5000' },
];

export const HIGH_CHIPS: ChipOption[] = [
    { value: 100, cls: 'ch100' },
    { value: 500, cls: 'ch500' },
    { value: 2500, cls: 'ch2500' },
    { value: 10000, cls: 'ch10000' },
    { value: 50000, cls: 'ch50000' },
];

export const DEFAULT_CHIPS = LOW_CHIPS;

export function getGameMode(gameName: string): GameMode {
    const name = gameName.toLowerCase();
    if (name.includes('high')) {
        return GameMode.HIGH;
    } else if (name.includes('middle')) {
        return GameMode.MIDDLE;
    }
    return GameMode.LOW;
}

export function getChipsForGame(gameName: string): ChipOption[] {
    const mode = getGameMode(gameName);
    switch (mode) {
        case GameMode.HIGH:
            return HIGH_CHIPS;
        case GameMode.MIDDLE:
            return MIDDLE_CHIPS;
        default:
            return LOW_CHIPS;
    }
}

export function getPokerDefaultBet(mode: GameMode): number {
    switch (mode) {
        case GameMode.HIGH:
            return 100;
        case GameMode.MIDDLE:
            return 50;
        default:
            return 10;
    }
}

export function getPokerTipAmount(mode: GameMode): number {
    switch (mode) {
        case GameMode.HIGH:
            return 50;
        case GameMode.MIDDLE:
            return 25;
        default:
            return 10;
    }
}

export function getBalanceLimits(mode: GameMode): { min: number, max: number } {
    switch (mode) {
        case GameMode.HIGH:
            return { min: 50000, max: Infinity };
        case GameMode.MIDDLE:
            return { min: 5000, max: 50000 };
        default:
            return { min: 0, max: 5000 };
    }
}

