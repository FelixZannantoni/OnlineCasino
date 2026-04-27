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

type GamePhase = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export class Poker extends CardGame<PokerPlayer> {

    private pokerDeck: PokerDeck;
    private pokerDeskCards: Card[];
    private defaultbet: number = 10;
    private currentBet: number;
    private pot: number;

    private currentPlayerIndex: number = 0;

    private phase: GamePhase = 'pre-flop';

    constructor(gameId: string) {
        super(gameId);
        this.pokerDeck = new PokerDeck();
        this.pokerDeskCards = [];
        this.pot = 0;
        this.currentBet = this.defaultbet;
    }

    public startGame() {
        this.phase = 'pre-flop';
        this.startNewHand();
    }

    private revealFlop() {
        this.pokerDeskCards[0].visibility = CardVisibility.all;
        this.pokerDeskCards[1].visibility = CardVisibility.all;
        this.pokerDeskCards[2].visibility = CardVisibility.all;
    }

    private revealTurn() {
        this.pokerDeskCards[3].visibility = CardVisibility.all;
    }

    private revealRiver() {
        this.pokerDeskCards[4].visibility = CardVisibility.all;
    }

    private isBettingRoundFinished(): boolean {
        return this.players.every(p =>
            p.isFolded() || // evtl. all in noch checken
            p.getBet() === this.currentBet || p.getPressedFold()
        );
    } 

    private startNewHand() {
        this.resetCards();
        this.pokerDeskCards = [];
        this.pokerDeck = new PokerDeck();
        this.resetBets();
        this.pot = 0;
        this.handCardsOut();
        this.setDeafaultBets();
        this.phase = 'pre-flop';
        this.currentPlayerIndex = CardGamePlayer.playerWithDealerChip(this.players);
    }
    
    private resetBettingRound() {
        this.currentBet = 0;
        this.players.forEach(p => p.setBet(0));
    }

    private nextPhase() {
        switch (this.phase) {
            case 'pre-flop':
                this.revealFlop();
                this.phase = 'flop';
                break;
            case 'flop':
                this.revealTurn();
                this.phase = 'turn';
                break;
            case 'turn':
                this.revealRiver();
                this.phase = 'river';
                break;
            case 'river':
                this.phase = 'showdown';
                if (this.players.filter(p => !p.getPressedFold()).length === 1) {
                    this.handOutWin();
                } else {
                    this.checkHands();
                    this.handOutWin();
                }
                break;
        }

        this.resetBettingRound();
        this.emit("gameState", this.getGameState());
    }

    public getGameState() {
        return {
            gameId: this.getGameId(),
            players: this.players.map(p => ({
                playerId: p.getPlayerId(),
                username: p.getUsername(),
                displayname: p.getDisplayname(),
                balance: p.getBalance(),
                bet: p.getBet(),
                hasDealerChip: p.getDealerChip(),
                cards: p.getCards() // Note: In a real game, cards should be filtered by visibility
            })),
            deskCards: this.pokerDeskCards,
            pot: this.pot,
            currentBet: this.currentBet
        };
    }

    private handCardsOut() {
        if (this.players.length === 0) return;
        const dealerIndex = CardGamePlayer.playerWithDealerChip(this.players);
        for (let i: number = 0; i < PLAYER_CARDS_NUMBER; i++) {
            for (let j: number = 0; j < this.players.length; j++) {
                this.players[Player.xNextPlayer(this.players, CardGamePlayer.playerWithDealerChip(this.players), j)]
                    .addCard(this.pokerDeck.dealCard(this.pokerDeck.getDeck(), this.players[j].getPlayerId()));
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

    getcurrentPlayer(): PokerPlayer {
        return this.players[this.currentPlayerIndex];
    }

    nextPlayer() {
        let counter = 0;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            counter++;
            if(counter > this.players.length) break; // prevent infinite loop if all players folded
        } while (this.players[this.currentPlayerIndex].getPressedFold());
    }

    public handlePlayerMove(playerId: string, action: string, amount?: number): { success: boolean, message: string } {
        const currentPlayer = this.getcurrentPlayer();

        if(currentPlayer.getPlayerId() !== playerId) {
            console.warn(`Player ${playerId} tried to make a move out of turn.`);
            return { success: false, message: "Not your turn" };
        }

        switch (action) {
            case "fold":
                currentPlayer.setFolded(true);
                break;
            case "check":
                if (currentPlayer.getBet() !== this.currentBet) {
                    return { success: false, message: "Cannot check, current bet is higher" };
                }
                break;
            case "bet":
                if (!amount || amount <= 0) {
                    return { success: false, message: "Invalid bet amount" };
                }
                currentPlayer.setBet(amount);
                this.currentBet = amount;
                this.pot += amount;
                break;
            case "call":
                if (currentPlayer.getBet() >= this.currentBet) {
                    return { success: false, message: "Cannot call, current bet is not higher" };
                }
                const diff = this.currentBet - currentPlayer.getBet();
                currentPlayer.setBet(this.currentBet);
                this.pot += diff;
                break;
            case "raise":
                if (!amount  || amount <= 0) {
                    return { success: false, message: "Invalid raise amount" };
                }
                if (currentPlayer.getBet() >= this.currentBet) {
                    return { success: false, message: "Cannot raise, current bet is not higher" };
                }
                const newBet = this.currentBet + amount;
                const raiseDiff = newBet - currentPlayer.getBet();

                currentPlayer.setBet(newBet);
                this.currentBet = newBet;
                this.pot += raiseDiff;
                break;
            default:
                return { success: false, message: "Invalid action" };
        }

        this.nextPlayer();
        if (this.isBettingRoundFinished()) {
            this.nextPhase();
        }
        this.emit("gameState", this.getGameState());
        return { success: true, message: "Move accepted" };
    }

    private checkHands() {
        for (let i: number = 0; i < this.players.length; i++) {
            let cards: Card[] = [];
            if (this.pokerDeskCards[4].visibility == CardVisibility.all) {
                cards = [...this.players[i].getCards(), ...this.pokerDeskCards];
            }
            else if (this.pokerDeskCards[3].visibility == CardVisibility.none) {
                cards = [...this.players[i].getCards(), ...this.pokerDeskCards.slice(0, 2)];
            }
            else if (this.pokerDeskCards[4].visibility == CardVisibility.none) {
                cards = [...this.players[i].getCards(), ...this.pokerDeskCards.slice(0, 3)];
            }
            this.players[i].checkHand(cards);
        }
    }

    private handOutWin() {
        let highestCombination: number = 0;
        let count: number = 1;
        let indexOfWinners: number[] = [0];

        for (let i: number = 0; i < this.players.length; i++) {
            if (this.players[i].getCardCombinationValue() > highestCombination) {
                highestCombination = this.players[i].getCardCombinationValue();
                indexOfWinners = [i];
                count = 1;
            }
            else if (this.players[i].getCardCombinationValue() == highestCombination) {
                if (this.players[i].getValueOfCardCombination() > this.players[indexOfWinners[0]].getValueOfCardCombination()) {
                    indexOfWinners = [i];
                }
                else if (this.players[i].getValueOfCardCombination() == this.players[indexOfWinners[0]].getValueOfCardCombination()) {
                    count++;
                    indexOfWinners[count] = i;
                }
            }
        }

        if (count == 1) {

            if (this.players[indexOfWinners[0]].getBet() < (this.pot / this.players.length)) {
                //TODO side pot
            }
            else {
                this.players[indexOfWinners[0]].winMoney(this.pot);
            }
        }

        else {
            for (let i: number = 0; i < indexOfWinners.length; i++) {
                if (this.players[indexOfWinners[i]].getBet() < (this.pot / this.players.length)) {
                    //TODO side pot
                }
                for (let i: number = 0; i < indexOfWinners.length; i++) {
                    this.players[indexOfWinners[i]].winMoney(this.pot / indexOfWinners.length);
                }
            }
        }
    }
}