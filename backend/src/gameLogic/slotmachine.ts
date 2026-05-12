import { SinglePlayerGame } from "./singlePlayerGame";
import { SlotmachinePlayer } from "./slotmachinePlayer";

export enum Symbols {
    "ans" = 1,
    "zwa" = 2,
    "drei" = 3,
    "vier" = 4,
    "fünf" = 5,
    "sex" = 6,
    "siebn" = 7,
    "acht" = 8,
    "neun" = 9,
    "zehn" = 10
}

export class Slotmachine extends SinglePlayerGame<SlotmachinePlayer> {

    private slots: Symbols[][]; // [row][col] -> 3 rows, 5 columns
    private lastWin: number = 0;

    private static readonly PAYOUTS: Record<number, number[]> = {
        [Symbols.ans]: [0, 0, 2, 5, 10],
        [Symbols.zwa]: [0, 0, 2, 5, 10],
        [Symbols.drei]: [0, 0, 3, 10, 20],
        [Symbols.vier]: [0, 0, 3, 10, 20],
        [Symbols.fünf]: [0, 0, 5, 15, 40],
        [Symbols.sex]: [0, 0, 5, 15, 40],
        [Symbols.siebn]: [0, 0, 10, 30, 100],
        [Symbols.acht]: [0, 0, 10, 30, 100],
        [Symbols.neun]: [0, 0, 20, 100, 500],
        [Symbols.zehn]: [0, 0, 50, 200, 1000]
    };

    private static readonly LINES = [
        [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], // Horizontal Middle
        [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // Horizontal Top
        [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // Horizontal Bottom
        [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]], // V-Shape (Down-Up)
        [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]], // V-Shape (Up-Down)
        [[1, 0], [2, 1], [2, 2], [2, 3], [1, 4]], // Middle-Bottom-Middle
        [[1, 0], [0, 1], [0, 2], [0, 3], [1, 4]], // Middle-Top-Middle
        [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]], // Bottom-Middle-Top Zigzag
        [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]], // Top-Middle-Bottom Zigzag
        [[2, 0], [1, 1], [1, 2], [1, 3], [0, 4]]  // M-Shape
    ];

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

    public startGame() {
        const bet: number = this.player.getDesiredBet();
        this.player.makeNewBet(bet);
        this.playRound();
    }

    public nextRound() {
        if (this.player.getPressedAutoSpin()) {
            try {
                this.player.makeBet();
                this.playRound();
            } catch (e) {
                // Not enough money for auto spin
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
        for (let x: number = 0; x < 3; x++) {
            this.slots[x] = [];
            for (let y: number = 0; y < 5; y++) {
                // Randomly pick a symbol
                const symbolValues = Object.values(Symbols).filter(v => typeof v === 'number') as number[];
                const randomSymbol = symbolValues[Math.floor(Math.random() * symbolValues.length)];
                this.slots[x][y] = randomSymbol as Symbols;
            }
        }
    }

    private checkSpin() {
        let totalWinMultiplier = 0;

        for (const line of Slotmachine.LINES) {
            let matchingCount = 1;
            const firstSymbol = this.slots[line[0][0]][line[0][1]];

            for (let i = 1; i < line.length; i++) {
                const currentSymbol = this.slots[line[i][0]][line[i][1]];
                if (currentSymbol === firstSymbol) {
                    matchingCount++;
                } else {
                    break;
                }
            }

            if (matchingCount >= 3) {
                const payoutArray = Slotmachine.PAYOUTS[firstSymbol];
                totalWinMultiplier += payoutArray[matchingCount - 1];
            }
        }

        const bet = this.player.getBet();
        this.lastWin = totalWinMultiplier * bet;
        this.player.winMoney(this.lastWin);
    }

    public handleMove() {
        if (this.player.getPressedSpin()) {
            try {
                this.player.makeBet();
                this.playRound();
            } catch (e) {
                // Not enough money
            }
        }
    }
}