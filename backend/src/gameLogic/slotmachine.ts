import { SinglePlayerGame } from "./singlePlayerGame";
import { SlotmachinePlayer } from "./slotmachinePlayer";

export enum Symbols {
    Seven = 0,
    Diamond = 1,
    Wild = 2,
    Star = 3,
    Bell = 4,
    DoubleBar = 5,
    Cherry = 6,
    Bar = 7
}

export class Slotmachine extends SinglePlayerGame<SlotmachinePlayer> {

    private slots: Symbols[][]; // [row][col]
    private lastWin: number = 0;

    private static readonly PAYOUTS: Record<number, number> = {
        [Symbols.Seven]: 50,
        [Symbols.Diamond]: 30,
        [Symbols.Wild]: 20,
        [Symbols.Star]: 15,
        [Symbols.Bell]: 10,
        [Symbols.DoubleBar]: 7,
        [Symbols.Cherry]: 5,
        [Symbols.Bar]: 3
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
            for (let y: number = 0; y < 3; y++) {
                // Randomly pick a symbol
                this.slots[x][y] = Math.floor(Math.random() * 8) as Symbols;
            }
        }
    }

    private checkSpin() {
        let totalWinMultiplier = 0;

        // Frontend only checks middle row for 3x3 match
        const midRowSymbols = [this.slots[1][0], this.slots[1][1], this.slots[1][2]];
        if (midRowSymbols[0] === midRowSymbols[1] && midRowSymbols[1] === midRowSymbols[2]) {
            totalWinMultiplier = Slotmachine.PAYOUTS[midRowSymbols[0]];
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
