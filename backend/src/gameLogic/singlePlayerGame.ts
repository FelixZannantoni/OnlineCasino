import { GamePlayer } from "./player";

export class SinglePlayerGame {
    private gameId: string;
    private player: GamePlayer | null;

    constructor(gameId: string) {
        this.gameId = gameId;
        this.player = null;
    }

    public getGameId() {
        return this.gameId;
    }

    public addPlayer(player: GamePlayer): void {
        if (this.player) {
            throw new Error("A player is already in the game");
        }
        else {
            this.player = player;
        }
    }

    public getPlayer(): GamePlayer | null {
        return this.player;
    }
}