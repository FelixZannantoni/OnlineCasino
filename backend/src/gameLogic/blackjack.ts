import { Card } from "../model";
import { BlackjackDeck } from "./blackjackDeck";
import { CardGame } from "./cardGame";
import { Deck } from "./deck";

export class Blackjack extends CardGame {
    private blackjackDeck: BlackjackDeck;

    constructor() {
        super();
        this.blackjackDeck = new BlackjackDeck();
        this.startGame();
    }
    
    private startGame()
    {

    }

    private nextRound()
    {

    }

    private playRound()
    {

        this.nextRound();
    }
}