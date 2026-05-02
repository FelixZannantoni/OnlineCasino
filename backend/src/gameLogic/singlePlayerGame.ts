import { Player } from "./player";

export class SinglePlayerGame<T extends Player = Player> {
    private gameId: string;
    protected player: T;

    constructor(gameId: string, player: T) {
        this.gameId = gameId;
        this.player = player;
    }

    public getGameId() {
        return this.gameId;
    }

    public getPlayer(): T | null {
        return this.player;
    }
}