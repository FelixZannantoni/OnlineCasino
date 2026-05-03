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

    public setBet(bet: number): void {
        if ((bet - this.bet) > (this.getBalance())) {
            throw new Error(`Not enogh money`);
        }
        this.balance -= bet - this.bet
        this.bet = bet;
    }

    public winMoney(win: number) {
        this.balance += win;
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

}