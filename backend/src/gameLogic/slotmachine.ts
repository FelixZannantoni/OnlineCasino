import { Game } from "./game";
import { SinglePlayerGame } from "./singlePlayerGame";
import { SlotmachinePlayer } from "./slotmachinePlayer";

export class Slotmachine extends SinglePlayerGame<SlotmachinePlayer> {

    private slots: Symbols[][];//3,5

    constructor(gameId: string, player: SlotmachinePlayer) {
        super(gameId, player);
        this.slots = [];
    }

    public startGame() {

    }

    public nextRound() {
        if (this.player.getPressedAutoSpin()) {

        }
    }


    public playRound() {
        this.spin();
        this.checkSpin();
    }

    private spin() {
        for (let x: number = 0; x < 3; x++) {
            for (let y: number = 0; y < 5; y++) {
                this.slots[x][y] = Math.floor(Math.random() * 10) + 1;
            }
        }
    }

    private checkSpin() {
        let win: number = 0;
        // 1. Horizontal Middle
        if (this.slots[1][0] == this.slots[1][1] && this.slots[1][1] == this.slots[1][2] && this.slots[1][2] == this.slots[1][3] && this.slots[1][3] == this.slots[1][4]) { win++; }

        // 2. Horizontal Top
        if (this.slots[0][0] == this.slots[0][1] && this.slots[0][1] == this.slots[0][2] && this.slots[0][2] == this.slots[0][3] && this.slots[0][3] == this.slots[0][4]) { win++; }

        // 3. Horizontal Bottom
        if (this.slots[2][0] == this.slots[2][1] && this.slots[2][1] == this.slots[2][2] && this.slots[2][2] == this.slots[2][3] && this.slots[2][3] == this.slots[2][4]) { win++; }

        // 4. V-Shape (Down-Up)
        if (this.slots[0][0] == this.slots[1][1] && this.slots[1][1] == this.slots[2][2] && this.slots[2][2] == this.slots[1][3] && this.slots[1][3] == this.slots[0][4]) { win++; }

        // 5. V-Shape (Up-Down)
        if (this.slots[2][0] == this.slots[1][1] && this.slots[1][1] == this.slots[0][2] && this.slots[0][2] == this.slots[1][3] && this.slots[1][3] == this.slots[2][4]) { win++; }

        // 6. Middle-Bottom-Middle Curve
        if (this.slots[1][0] == this.slots[2][1] && this.slots[2][1] == this.slots[2][2] && this.slots[2][2] == this.slots[2][3] && this.slots[2][3] == this.slots[1][4]) { win++; }

        // 7. Middle-Top-Middle Curve
        if (this.slots[1][0] == this.slots[0][1] && this.slots[0][1] == this.slots[0][2] && this.slots[0][2] == this.slots[0][3] && this.slots[0][3] == this.slots[1][4]) { win++; }

        // 8. Bottom-Middle-Top Zigzag
        if (this.slots[2][0] == this.slots[2][1] && this.slots[2][1] == this.slots[1][2] && this.slots[1][2] == this.slots[0][3] && this.slots[0][3] == this.slots[0][4]) { win++; }

        // 9. Top-Middle-Bottom Zigzag
        if (this.slots[0][0] == this.slots[0][1] && this.slots[1][2] == this.slots[1][2] && this.slots[1][2] == this.slots[2][3] && this.slots[2][3] == this.slots[2][4]) { win++; }

        // 10. Bottom-Middle-Top-Middle-Bottom (M-Shape)
        if (this.slots[2][0] == this.slots[1][1] && this.slots[1][1] == this.slots[1][2] && this.slots[1][2] == this.slots[1][3] && this.slots[1][3] == this.slots[0][4]) { win++; }
    }
}


/*winging combs
[1,0] [1,1] [1,2] [1,3] [1,4]
[0,0] [0,1] [0,2] [0,3] [0,4]
[2,0] [2,1] [2,2] [2,3] [2,4]
[0,0] [1,1] [2,2] [1,3] [0,4]
[2,0] [1,1] [0,2] [1,3] [2,4]

[1,0] [2,1] [2,2] [2,3] [1,4]
[1,0] [0,1] [0,2] [0,3] [1,4]
[2,0] [2,1] [1,2] [0,3] [0,4]
[0,0] [0,1] [1,2] [2,3] [2,4]
[2,0] [1,1] [1,2] [1,3] [0,4]
*/



enum Symbols {
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