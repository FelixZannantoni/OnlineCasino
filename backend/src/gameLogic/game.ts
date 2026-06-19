import { EventEmitter } from "events";
import { Player } from "./player";

export class Game<T extends Player = Player> extends EventEmitter {
    protected players: T[];
    private gameId: string;
    private gameName: string;
    protected currentRoundId: number = -1;
    protected gameBalance: number = Infinity;
    protected maxPlayers: number = Infinity;

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

    public getGameBalance() {
        return this.gameBalance;
    }

    public setGameBalance(balance: number) {
        this.gameBalance = balance;
    }

    public addPlayer(player: T): void {
        if (this.players.find(p => p.getPlayerId() == player.getPlayerId())) {
            throw new Error("Player with this id is already in the game");
        }
        
        if (this.players.length >= this.maxPlayers) {
            throw new Error("Game is full");
        }

        if (player.getBalance() > this.gameBalance) {
            player.setBalance(this.gameBalance);
        }
        this.players.push(player);
    }

    public getPlayers(): T[] {
        return this.players;
    }

    public removePlayer(playerId: string): void {
        this.players = this.players.filter(p => p.getPlayerId() !== playerId);
    }
}