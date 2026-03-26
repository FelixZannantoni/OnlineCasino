import { Player } from "./player";

export class Game<T extends Player = Player> {
    protected players: T[];
    private gameId: string;

    constructor(gameId: string) {
        this.players = [];
        this.gameId = gameId;
    }

    public getGameId() {
        return this.gameId;
    }

    public addPlayer(player: T): void {
        this.players.push(player);
    }

    public getPlayers(): T[] {
        return this.players;
    }
}