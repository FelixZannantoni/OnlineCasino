export class GamePlayer {
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

    public static xNextPlayer(players: GamePlayer[], i: number, x: number): number {
        for (let j: number = 0; j < x; j++) {
            i = this.nextPlayer(players, i);
        }
        return i;
    }

    public static nextPlayer(players: GamePlayer[], i: number) {
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

    public isOutOfMoney(): boolean {
        if (this.balance == 0) {
            return true;
        }
        return false;
    }
}