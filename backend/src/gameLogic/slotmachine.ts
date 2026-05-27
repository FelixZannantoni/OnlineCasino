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

    private static readonly MATCH_MULTIPLIERS: Record<number, number> = {
        3: 0.2,
        4: 0.5,
        5: 1.0
    };


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

    private static readonly SYMBOLS: Record<number, { mult: number, weight: number }> = {
        [Symbols.Bar]: { mult: 10, weight: 100 },
        [Symbols.Cherry]: { mult: 10, weight: 100 },
        [Symbols.DoubleBar]: { mult: 20, weight: 50 },
        [Symbols.Bell]: { mult: 20, weight: 50 },
        [Symbols.Horseshoe]: { mult: 40, weight: 25 },
        [Symbols.Star]: { mult: 40, weight: 25 },
        [Symbols.Clover]: { mult: 100, weight: 10 },
        [Symbols.Wild]: { mult: 100, weight: 10 },
        [Symbols.Diamond]: { mult: 500, weight: 5 },
        [Symbols.Seven]: { mult: 1000, weight: 2 },
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
            if (this.player.getPressedAutoSpin()) {
                setTimeout(() => this.nextRound(), 1000);
            }
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
                setTimeout(() => this.nextRound(), 1000); // Use a small timeout or process next tick to avoid stack overflow
            } catch (e) {
                this.player.stopAutoSpin();
            }
        }
        this.playRound();
    }


    public playRound() {
        this.spin();
        this.checkSpin();
    }

    private spin() {
        const symbolEntries = Object.entries(Slotmachine.SYMBOLS);
        const totalWeight = symbolEntries.reduce((acc, [_, def]) => acc + def.weight, 0);

        this.slots = [[], [], []];
        for (let x: number = 0; x < 3; x++) {
            for (let y: number = 0; y < 5; y++) {
                let random = Math.random() * totalWeight;
                let selectedSymbol = Symbols.Bar;

                for (const [id, def] of symbolEntries) {
                    if (random < def.weight) {
                        selectedSymbol = Number(id) as Symbols;
                        break;
                    }
                    random -= def.weight;
                }
                this.slots[x][y] = selectedSymbol;
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
                const baseMult = Slotmachine.SYMBOLS[targetSymbol].mult;
                const matchFactor = Slotmachine.MATCH_MULTIPLIERS[matchCount] || 0;
                
                totalWinMultiplier += baseMult * matchFactor;
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
                this.nextRound();
            } catch (e) {
                console.error("Slotmachine move failed:", e);
            }
        }
    }
}
