import { Player } from "./player";


export enum rouletteField {
    ZERO = "0",
    ONE = "1",
    TWO = "2",
    THREE = "3",
    FOUR = "4",
    FIVE = "5",
    SIX = "6",
    SEVEN = "7",
    EIGHT = "8",
    NINE = "9",
    TEN = "10",
    ELEVEN = "11",
    TWELVE = "12",
    THIRTEEN = "13",
    FOURTEEN = "14",
    FIFTEEN = "15",
    SIXTEEN = "16",
    SEVENTEEN = "17",
    EIGHTEEN = "18",
    NINETEEN = "19",
    TWENTY = "20",
    TWENTY_ONE = "21",
    TWENTY_TWO = "22",
    TWENTY_THREE = "23",
    TWENTY_FOUR = "24",
    TWENTY_FIVE = "25",
    TWENTY_SIX = "26",
    TWENTY_SEVEN = "27",
    TWENTY_EIGHT = "28",
    TWENTY_NINE = "29",
    THIRTY = "30",
    THIRTY_ONE = "31",
    THIRTY_TWO = "32",
    THIRTY_THREE = "33",
    THIRTY_FOUR = "34",
    THIRTY_FIVE = "35",
    THIRTY_SIX = "36",
    RED = "RED",
    BLACK = "BLACK",
    EVEN = "EVEN",
    ODD = "ODD",
    LOW = "1-18",
    HIGH = "19-36",
    FIRST_DOZEN = "1st Dozen",
    SECOND_DOZEN = "2nd Dozen",
    THIRD_DOZEN = "3rd Dozen",
    COLUMN_ONE = "1st Col",
    COLUMN_TWO = "2nd Col",
    COLUMN_THREE = "3rd Col"
}

export class RoulettePlayer extends Player {
    private isReady: boolean;
    private playerBets: Record<rouletteField, number>;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.isReady = false;
        this.playerBets = this.initPlayerBets();
    }

    private initPlayerBets(): Record<rouletteField, number> {
        const bets = {} as Record<rouletteField, number>;
        for (const field of Object.values(rouletteField)) {
            bets[field as rouletteField] = 0;
        }
        return bets;
    }

    public setReady(ready: boolean): void {
        this.isReady = ready;
    }

    public getIsReady(): boolean {
        return this.isReady;
    }

    public resetReady(): void {
        this.isReady = false;
    }

    public placeBet(field: rouletteField, amount: number): void {
        this.makeIncreasedBet(this.getBet() + amount);
        this.playerBets[field] += amount;
    }

    public clearBets(): void {
        this.playerBets = this.initPlayerBets();
        this.makeNewBet(0);
    }

    public getPlayerBets(): { field: string, amount: number }[] {
        return Object.entries(this.playerBets)
            .filter(([_, amount]) => amount > 0)
            .map(([field, amount]) => ({ field, amount }));
    }
}