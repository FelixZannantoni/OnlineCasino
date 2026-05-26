import { SinglePlayerGame } from "./singlePlayerGame";
import { SlotmachinePlayer } from "./slotmachinePlayer";

export enum Symbols {
    Bar = 1,
    Cherry = 2,
    DoubleBar = 3,
    Bell = 4,
    Horseshoe = 5,
    Star = 6,
    Clover = 7,
    Wild = 8,
    Diamond = 9,
    Seven = 10
}

export class Slotmachine extends SinglePlayerGame<SlotmachinePlayer> {

    private slots: Symbols[][]; // [row][col] -> 3 rows, 5 columns
    private lastWin: number = 0;
    private winningLines: number[] = [];


    public static readonly WIN_LINES = [
        [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], // Horizontal Middle (Line 0)
        [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // Horizontal Top (Line 1)
        [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // Horizontal Bottom (Line 2)
        [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]], // V-Shape (Down-Up) (Line 3)
        [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]], // V-Shape (Up-Down) (Line 4)
        [[1, 0], [2, 1], [2, 2], [2, 3], [1, 4]], // Middle-Bottom-Middle (Line 5)
        [[1, 0], [0, 1], [0, 2], [0, 3], [1, 4]], // Middle-Top-Middle (Line 6)
        [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]], // Bottom-Middle-Top Zigzag (Line 7)
        [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]], // Top-Middle-Bottom Zigzag (Line 8)
        [[2, 0], [1, 1], [1, 2], [1, 3], [0, 4]]  // M-Shape (Line 9)
    ];

    private static readonly SYMBOL_DEFS: Record<number, { mult: number }> = {
        [Symbols.Bar]: { mult: 10 },
        [Symbols.Cherry]: { mult: 10 },
        [Symbols.DoubleBar]: { mult: 20 },
        [Symbols.Bell]: { mult: 20 },
        [Symbols.Horseshoe]: { mult: 40 },
        [Symbols.Star]: { mult: 40 },
        [Symbols.Clover]: { mult: 100 },
        [Symbols.Wild]: { mult: 100 },
        [Symbols.Diamond]: { mult: 500 },
        [Symbols.Seven]: { mult: 1000 },
    };

    constructor(gameId: string, player: SlotmachinePlayer) {
        super(gameId, player);
        this.slots = [
            [], [], []
        ];
    }

    public getSlots(): Symbols[][] {
        return this.slots;
    }

    public getLastWin(): number {
        return this.lastWin;
    }

    public getWinningLines(): number[] {
        return this.winningLines;
    }

    public startGame() {
        const bet: number = this.player.getDesiredBet();
        try {
            this.player.makeNewBet(bet);
            this.playRound();
        } catch (e) {
           console.error("Failed to start slot game:", e);
           throw e;
        }
    }

    private nextRound() {
        if (this.player.getPressedAutoSpin()) {
            try {
                this.player.makeBet();
                this.playRound();
            } catch (e) {
                this.player.stopAutoSpin();
                this.handleMove();
            }
        }
        else {
            this.handleMove()
        }
    }


    public playRound() {
        this.spin();
        this.checkSpin();
    }

    private spin() {
        const symbolValues = Object.values(Symbols).filter(v => typeof v === 'number') as number[];
        this.slots = [[], [], []];
        for (let x: number = 0; x < 3; x++) {
            for (let y: number = 0; y < 5; y++) {
                const randomIndex = Math.floor(Math.random() * symbolValues.length);
                this.slots[x][y] = symbolValues[randomIndex] as Symbols;
            }
        }
    }

    private checkSpin() {
        this.winningLines = [];
        let totalWinMultiplier = 0;

        for (let i = 0; i < Slotmachine.WIN_LINES.length; i++) {
            const line = Slotmachine.WIN_LINES[i];

            let targetSymbol = Symbols.Wild;
            let matchCount = 0;

            for (let j = 0; j < line.length; j++) {
                const currentSymbol = this.slots[line[j][0]][line[j][1]];

                if (targetSymbol === Symbols.Wild) {
                    targetSymbol = currentSymbol;
                    matchCount++;
                } else if (currentSymbol === targetSymbol || currentSymbol === Symbols.Wild) {
                    matchCount++;
                } else {
                    break;
                }
            }

            if (matchCount >= 3) {
                this.winningLines.push(i);
                const baseMult = Slotmachine.SYMBOL_DEFS[targetSymbol].mult;

                // Adjust multiplier based on match count
                // 3 symbols: 10%, 4 symbols: 40%, 5 symbols: 100% of the base multiplier
                if (matchCount === 3) totalWinMultiplier += baseMult * 0.1;
                else if (matchCount === 4) totalWinMultiplier += baseMult * 0.4;
                else if (matchCount === 5) totalWinMultiplier += baseMult;
            }
        }

        const bet = this.player.getBet();
        this.lastWin = Math.floor(totalWinMultiplier * bet);
        this.player.winMoney(this.lastWin);
    }

    public handleMove() {
        if (this.player.getPressedSpin()) {
            try {
                this.player.makeBet();
                this.playRound();
            } catch (e) {
                console.error("Slotmachine move failed:", e);
            }
        }
    }
}
