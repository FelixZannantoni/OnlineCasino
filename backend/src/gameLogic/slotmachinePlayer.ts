import { Player } from "./player"

export class slotmachinePlayer extends Player {

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
    }
}