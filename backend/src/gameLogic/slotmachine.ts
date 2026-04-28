import { Game } from "./gamePlayer";
import { SlotmachinePlayer, slotmachinePlayer } from "./slotmachinePlayer";

export class slotmachine extends Game {

    private slotmachinePlayer: SlotmachinePlayer = new SlotmachinePlayer;
    constructor(gameId: string) {
        super(gameId);
    }

    public startGame() {

    }

    public nextRound() {
        this.spin();
    }

    public startRound() {
        if
    }

    private spin() {

    }
}