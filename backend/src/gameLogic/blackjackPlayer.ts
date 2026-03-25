import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";

export class BlackjackPlayer extends CardGamePlayer {
    private pressedHit: boolean;
    private pressedStand: boolean;
    private pressedDoubble: boolean;
    private handValue: number;

    constructor(playerId: string, username: string, displayname: string, balance: number) {
        super(playerId, username, displayname, balance);
        this.pressedHit = false;
        this.pressedStand = false;
        this.pressedDoubble = false;
        this.handValue = 0;
    }

    public checkHandValue(cards: Card[]) {
        this.handValue = 0;
        for (let i: number = 0; i < cards.length; i++) {
            this.handValue += cards[i].value;
        }
    }
}