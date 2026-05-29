import { Player } from "./player";

export class RoulettePlayer extends Player{
    private pressedSpin: boolean;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedSpin = false;
    }
    //TODO record oder 2d arry von service

}