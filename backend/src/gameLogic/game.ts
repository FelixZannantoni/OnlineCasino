import { EventEmitter } from "events";
import { Player } from "./player";

export class Game<T extends Player = Player> extends EventEmitter {
    protected players: T[];
    private gameId: string;

    constructor(gameId: string) {
        super();
        this.players = [];
        this.gameId = gameId;
    }

    public getGameId() {
        return this.gameId;
    }

    public addPlayer(player: T): void {
        if (this.players.find(p => p.getPlayerId() == player.getPlayerId())) {
            throw new Error("Player with this id is already in the game");
        }
        else {
            this.players.push(player);
        }
    }

    public getPlayers(): T[] {
        return this.players;
    }
}