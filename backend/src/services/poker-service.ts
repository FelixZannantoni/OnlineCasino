import { Poker } from "../gameLogic/poker";
import { PokerPlayer } from "../gameLogic/pokerPlayer";

export class PokerService {
    async fold(playerId: string, gameId: string): Promise<void> {
        // get the game and player objects
        //let game: Poker = Poker.getGameById(gameId); // doesnt work for now because that function is not implemented yet, instead just use a placeholder game object
        let game: Poker = new Poker(); // placeholder game object
        const player: PokerPlayer | undefined = game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            console.error(`Player with the id ${playerId} was not found in game ${gameId}`);
            return;
        }
        player.setPressedFold(true);
    }

    /**
     * Add a player to a game of poker.
     * @param playerId 
     * @param username 
     * @param displayname 
     * @param balance 
     * @param hasDealerChip 
     * @param bet 
     * @param gameId 
     */
    async addPlayer(playerId: string, username: string, displayname: string, balance: number, hasDealerChip: boolean, bet: number, gameId: string): Promise<void> {
        // get the game object
        //let game: Poker = Poker.getGameById(gameId); // doesnt work for now because that function is not implemented yet, instead just use a placeholder game object
        let game: Poker = new Poker(); // placeholder game object

        const newPlayer: PokerPlayer = new PokerPlayer(playerId, username, displayname, balance);
        game.addPlayer(newPlayer);
    }
}