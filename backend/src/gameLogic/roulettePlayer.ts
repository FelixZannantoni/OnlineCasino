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
    RED = "red",
    BLACK = "black",
    EVEN = "even",
    ODD = "odd",
    LOW = "1-18",
    HIGH = "19-36",
    FIRST_DOZEN = "1st12",
    SECOND_DOZEN = "2nd12",
    THIRD_DOZEN = "3rd12",
    COLUMN_ONE = "col1",
    COLUMN_TWO = "col2",
    COLUMN_THREE = "col3"
}

export class RoulettePlayer extends Player {
    private pressedSpin: boolean;
    private playerBets!: Record<rouletteField, number>;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedSpin = false;
        this.initPlayerBets();
    }

    private initPlayerBets(): void {
        // First, initialize the property as an empty object cast to the Record type
        this.playerBets = {} as Record<rouletteField, number>;
        // Then, iterate through all enum values to set each field's initial bet to 0
        for (const field of Object.values(rouletteField)) {
            this.playerBets[field as rouletteField] = 0;
        }
    }

}