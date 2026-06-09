export interface ChipOption {
    value: number;
    cls: string;
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

export function getChipsForGame(gameName: string): ChipOption[] {
    const name = gameName.toLowerCase();
    if (name.includes('vip')) {
        return HIGH_CHIPS;
    } else if (name.includes('high stakes')) {
        return MIDDLE_CHIPS;
    }
    return LOW_CHIPS;
}
