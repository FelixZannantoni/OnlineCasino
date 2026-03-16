import { CardVisibility, DEALER_ID } from "./deck";
import { Player } from "./player";
import { CardGame } from "./cardGame";
import { PokerDeck } from "./pokerDeck";
import { Card } from "../model";
import { CardGamePlayer } from "./cardGamePlayer";
import { PokerPlayer } from "./pokerPlayer";

export const MAX_PLAYER_COUNT: number = 5;
export const PLAYER_CARDS_NUMBER: number = 2;
export const POKER_CARDS_NUMBER: number = 5;
export const POKER_DESK_ID: string = "PokerDesk";

export class Poker extends CardGame<PokerPlayer> {

    private pokerDeck: PokerDeck;
    private pokerDeskCards: Card[];
    private defaultbet: number = 10;
    private currentBet: number;
    private pot: number;


    constructor(gameId: string) {
        super(gameId);
        this.pokerDeck = new PokerDeck();
        this.pokerDeskCards = [];
        this.pot = 0;
        this.currentBet = this.defaultbet;
    }

    public startGame() {
        this.setDefaultDealerChip();
        this.handCardsOut();
        this.setDeafaultBets();
        this.playRound();
    }

    private nextRound() {
        //TODO überprüfen ob pleite
        this.resetCards();
        this.resetBets();
        this.pot = 0;
        this.currentBet = this.defaultbet;

        this.updateDealerChip();
        this.handCardsOut();
        this.setDeafaultBets();

        this.playRound();
    }

    private handCardsOut() {
        if (this.players.length === 0) return;
        const dealerIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j: number = 0; j < this.players.length; j++) {
                this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), j)]
                    .addCard(this.pokerDeck.dealCard(this.pokerDeck.getDeck(), this.players[j].getPlayerId()), this.players[j].getPlayerId());
            }
        }

        for (let i: number = 0; i < POKER_CARDS_NUMBER; i++) {
            this.pokerDeskCards.push(this.pokerDeck.dealCard(this.pokerDeck.getDeck(), POKER_DESK_ID));
        }
    }

    private resetCards() {
        for (let i: number = 0; i < this.pokerDeskCards.length; i++) {
            this.pokerDeskCards[i].owner = DEALER_ID;
        }
        for (const player of this.players) {
            player.clearHand();
        }
    }

    private resetBets() {
        for (let i: number = 0; i < this.players.length; i++) {
            this.players[i].setBet(0);
        }
    }

    private setDeafaultBets() {
        this.resetBets();
        this.players[CardGamePlayer.playerWithDealerChip(this.players)].setBet(0);
        this.players[Player.nextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players))].setBet(this.defaultbet / 2);
        this.pot += this.defaultbet / 2;
        if (this.players.length >= 3) {
            this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), 2)].setBet(this.defaultbet);
            this.pot += this.defaultbet;
        }
    }

    private makeMove() {
        for (let i: number = 0; i < this.players.length; i++) {
            const playerOnMove: PokerPlayer = this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), i)];
            if (playerOnMove.getPressedFold() == true) {
                //TODO leaf Round
            }
            else if (playerOnMove.getPressedCheck() == true) {
                if (playerOnMove.getBet() == this.currentBet) {

                }
                else {
                    //TODO Error handling
                }
            }
            else if (playerOnMove.getPressedBet() == true) {
                const bet: number = 0;
                //server.getBet
                playerOnMove.setBet(bet)
                this.currentBet += bet;
                this.pot += bet;
            }
            else if (playerOnMove.getPressedCall() == true) {
                if (playerOnMove.getBet() < this.currentBet) {
                    playerOnMove.setBet(this.currentBet);
                    this.pot += this.currentBet - playerOnMove.getBet();
                }
            }
            else if (playerOnMove.getPressedRaise() == true) {
                if (playerOnMove.getBet() < this.currentBet) {
                    playerOnMove.setBet(this.currentBet);
                    this.pot += this.currentBet - playerOnMove.getBet();
                }
                const bet: number = 0;
                //server.getBet
                playerOnMove.setBet(bet)
                this.currentBet += bet;
                this.pot += bet;
            }
            else {
                //TODO Error Handling
            }
        }
    }

    private checkWinner(){
        for(let i: number = 0; i < this.players.length; i++)
        {
            let cards: Card[] = [];
            cards.push(this.players[i].getCards());
            cards.push(this.pokerDeskCards);
        }
    }

    private hasRoyalFlush(){

    }

    private hasStraightFlush(){

    }

    private hasQuadruple(){

    }

    private hasFullHouse(){

    }

    private hasFlush()
    {

    }

    private hasStraight(){

    }

    private hasTripple(){

    }

    private hasPair(){

    }

    private hasHighCard()
    {

    }


    private playRound() {//TODO check winner auch wenn dafor aus, und allin
        this.makeMove();
        this.currentBet = this.defaultbet;
        this.pokerDeskCards[0].visibility = CardVisibility.all;
        this.pokerDeskCards[1].visibility = CardVisibility.all;
        this.pokerDeskCards[2].visibility = CardVisibility.all;
        this.makeMove();
        this.currentBet = this.defaultbet;
        this.pokerDeskCards[3].visibility = CardVisibility.all;
        this.makeMove();
        this.currentBet = this.defaultbet;
        this.pokerDeskCards[4].visibility = CardVisibility.all;
        this.makeMove();
        //check winner
        //distribute profits
        this.nextRound();
    }
}