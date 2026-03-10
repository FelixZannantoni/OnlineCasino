import { Player } from "./player";

export class Game<T extends Player = Player> {
    protected players: T[];

    constructor() {
        this.players = [];
    }

    public addPlayer(player: T): void {
        this.players.push(player);
    }

    public getPlayers(): T[] {
        return this.players;
    }
}
