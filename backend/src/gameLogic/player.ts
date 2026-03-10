import { Card } from "../model";

export class Player {
    //auf private setzen
    private playerId: string;
    private username: string;
    private displayname: string;
    private balance: number = 0;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        this.playerId = playerId;
        this.username = username;
        this.displayname = displayname;
        this.balance = balance;
    }

    public getPlayerId(): string {
        return this.playerId;
    }

    public getUsername(): string {
        return this.username;
    }

    public getDisplayname(): string {
        return this.displayname;
    }

    public static xNextPlayer(players: Player[], i: number, x: number): number {
        for (let j: number = 0; j < x; j++) {
            i = this.nextPlayer(players, i);
        }
        return i;
    }

    public static nextPlayer(players: Player[], i: number) {
        if (i < players.length) {
            return i + 1;
        }
        else if (i == players.length) {
            return 0;
        }
        else {
            throw new Error(`Player not found`);
        }
    }
}