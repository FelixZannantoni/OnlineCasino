import { Game } from "./game";
import { SinglePlayerGame } from "./singlePlayerGame";

export class slotmachine extends SinglePlayerGame {

    constructor(gameId: string) {
        super(gameId);
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