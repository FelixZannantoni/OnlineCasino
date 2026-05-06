import { Game } from "./game";
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

    private slots: Symbols[][];//3,5
    private lastWin: number = 0;

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
            this.player.makeBet();
            this.playRound();
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
                this.slots[x][y] = (Math.floor(Math.random() * 10) + 1) as Symbols;
            }
        }
    }

    private checkSpin() {
        let winningLines: number = 0;
        // 1. Horizontal Middle
        if (this.slots[1][0] == this.slots[1][1] && this.slots[1][1] == this.slots[1][2] && this.slots[1][2] == this.slots[1][3] && this.slots[1][3] == this.slots[1][4]) { winningLines++; }

        // 2. Horizontal Top
        if (this.slots[0][0] == this.slots[0][1] && this.slots[0][1] == this.slots[0][2] && this.slots[0][2] == this.slots[0][3] && this.slots[0][3] == this.slots[0][4]) { winningLines++; }

        // 3. Horizontal Bottom
        if (this.slots[2][0] == this.slots[2][1] && this.slots[2][1] == this.slots[2][2] && this.slots[2][2] == this.slots[2][3] && this.slots[2][3] == this.slots[2][4]) { winningLines++; }

        // 4. V-Shape (Down-Up)
        if (this.slots[0][0] == this.slots[1][1] && this.slots[1][1] == this.slots[2][2] && this.slots[2][2] == this.slots[1][3] && this.slots[1][3] == this.slots[0][4]) { winningLines++; }

        // 5. V-Shape (Up-Down)
        if (this.slots[2][0] == this.slots[1][1] && this.slots[1][1] == this.slots[0][2] && this.slots[0][2] == this.slots[1][3] && this.slots[1][3] == this.slots[2][4]) { winningLines++; }

        // 6. Middle-Bottom-Middle Curve
        if (this.slots[1][0] == this.slots[2][1] && this.slots[2][1] == this.slots[2][2] && this.slots[2][2] == this.slots[2][3] && this.slots[2][3] == this.slots[1][4]) { winningLines++; }

        // 7. Middle-Top-Middle Curve
        if (this.slots[1][0] == this.slots[0][1] && this.slots[0][1] == this.slots[0][2] && this.slots[0][2] == this.slots[0][3] && this.slots[0][3] == this.slots[1][4]) { winningLines++; }

        // 8. Bottom-Middle-Top Zigzag
        if (this.slots[2][0] == this.slots[2][1] && this.slots[2][1] == this.slots[1][2] && this.slots[1][2] == this.slots[0][3] && this.slots[0][3] == this.slots[0][4]) { winningLines++; }

        // 9. Top-Middle-Bottom Zigzag
        if (this.slots[0][0] == this.slots[0][1] && this.slots[1][2] == this.slots[1][2] && this.slots[1][2] == this.slots[2][3] && this.slots[2][3] == this.slots[2][4]) { winningLines++; }

        // 10. Bottom-Middle-Top-Middle-Bottom (M-Shape)
        if (this.slots[2][0] == this.slots[1][1] && this.slots[1][1] == this.slots[1][2] && this.slots[1][2] == this.slots[1][3] && this.slots[1][3] == this.slots[0][4]) { winningLines++; }

        const bet = this.player.getBet();
        this.lastWin = winningLines * bet * 5; //TODO make real win multipliers
        this.player.winMoney(this.lastWin);
    }

    handleMove() {
        if (this.player.getPressedSpin()) {
            this.playRound();
        }
        //TODO bet
    }
}