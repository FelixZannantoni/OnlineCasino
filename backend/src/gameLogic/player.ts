import { userService } from "../app";
import { statsService } from "../app";

export class Player {
    private playerId: string;
    private username: string;
    private displayname: string;
    private balance: number;
    private bet: number;
    private desiredBet: number;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        this.playerId = playerId;
        this.username = username;
        this.displayname = displayname;
        this.balance = balance;
        this.bet = 0;
        this.desiredBet = 0;
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

    public getBalance(): number {
        return this.balance;
    }

    public setBalance(balance: number): void {
        this.balance = balance;
    }


    public getBet(): number {
        return this.bet;
    }

    public getDesiredBet(): number {
        return this.desiredBet;
    }

    public setDesiredBet(desiredBet: number): boolean {
        if ((this.bet + desiredBet) > this.balance) {
            return false;
        }
        this.desiredBet = desiredBet;
        return true;
    }

    public makeBet(): void {
        if ((this.bet) > (this.getBalance())) {
            throw new Error(`Not enogh money`);
        }
        this.balance -= this.bet;

        // dont await this, because we dont want to wait for the database to update, we can do it in the background
        userService.updateUserBalance(this.playerId, this.balance);
    }

    public makeNewBet(bet: number) {
        if ((bet) > (this.getBalance())) {
            throw new Error(`Not enogh money`);
        }
        this.bet = bet;
        this.makeBet()
    }

    public makeIncreasedBet(bet: number): void {
        if ((bet - this.bet) > (this.getBalance())) {
            throw new Error(`Not enogh money`);
        }
        this.balance -= (bet - this.bet);
        this.bet = bet;

        // dont await this, because we dont want to wait for the database to update, we can do it in the background
        userService.updateUserBalance(this.playerId, this.balance);
    }

    public async winMoney(win: number, cap: number = Infinity) {
        this.balance = Math.min(this.balance + win, cap);

        // dont await this, because we dont want to wait for the database to update, we can do it in the background
        userService.updateUserBalance(this.playerId, this.balance);
      
        statsService.onPlayerWin(this.playerId);
    }

    public makeTip(amount: number): void {
        if (amount > this.balance) {
            throw new Error(`Not enough money`);
        }
        this.balance -= amount;
    }

    public static xNextPlayer(players: Player[], i: number, x: number): number {
        for (let j: number = 0; j < x; j++) {
            i = this.nextPlayer(players, i);
        }
        return i;
    }

    /**
     * 
     * @param players an array of players
     * @param i the index of the current player
     * @returns the index of the next player
     */
    public static nextPlayer(players: Player[], i: number) {
        if(players.length === 0) {
            throw new Error(`No players available!`);
        }

        if(i < 0 || i >= players.length) {
            throw new Error(`Player index out of bounds`);
        }

        return (i+1) % players.length;
    }

    public isOutOfMoney(): boolean {
        if (this.balance == 0) {
            return true;
        }
        return false;
    }

    public updatePlayerInfo(username: string, displayname: string): void {
        this.username = username;
        this.displayname = displayname;
    }
}