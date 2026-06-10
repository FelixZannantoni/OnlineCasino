import { EventEmitter } from "events";
import { Player } from "./player";

export class Game<T extends Player = Player> extends EventEmitter {
    protected players: T[];
    private gameId: string;
    private gameName: string;
    protected currentRoundId: number = -1;

    constructor(gameId: string, gameName: string = "") {
        super();
        this.players = [];
        this.gameId = gameId;
        this.gameName = gameName || gameId;
    }

    public getGameId() {
        return this.gameId;
    }

    public getGameName() {
        return this.gameName;
    }

    public setGameName(name: string) {
        this.gameName = name;
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

    public removePlayer(playerId: string): void {
        this.players = this.players.filter(p => p.getPlayerId() !== playerId);
    }
}