export interface ChipOption {
    value: number;
    cls: string;
}

export const DEFAULT_CHIPS: ChipOption[] = [
    { value: 1, cls: 'ch1' },
    { value: 5, cls: 'ch5' },
    { value: 25, cls: 'ch25' },
    { value: 100, cls: 'ch100' },
    { value: 500, cls: 'ch500' },
];
