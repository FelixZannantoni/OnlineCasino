import { Game } from "./game";
import { SinglePlayerGame } from "./singlePlayerGame";

export class slotmachine extends SinglePlayerGame {

    private slots: Symbols[][];//3,5

    constructor(gameId: string) {
        super(gameId);
        this.slots = [];
    }

    public startGame() {

    }

    public nextRound() {
        this.spin();
    }


    public startRound() {

    }

    private spin() {

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



enum Symbols{
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