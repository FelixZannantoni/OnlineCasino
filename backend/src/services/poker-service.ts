import { Database } from "better-sqlite3";
import { Poker } from "../gameLogic/poker";
import { PokerPlayer } from "../gameLogic/pokerPlayer";
import { DB } from "../data";

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
        let game: Poker | null = await this.getGameById(gameId); // doesnt work for now because that function is not implemented yet, instead just use a placeholder game object
        //let game: Poker = new Poker(); // placeholder game object
        if(!game) return;

        const newPlayer: PokerPlayer = new PokerPlayer(playerId, username, displayname, balance, hasDealerChip, bet);
        game.addPlayer(newPlayer);
    }

    async getGameById(gameId: string): Promise<Poker | null> {
        try {
            const connection: Database = await DB.createDBConnection();
            const type = "POKER";

            type GameRow = {
                gameId: string;
                type: string;
            };

            const result = connection.prepare<[string, string], GameRow>("SELECT * FROM games WHERE gameId = ? AND type = ?")
                .get(gameId, type);
        
            await connection.close();

            if(!result) {
                console.error(`Game with the id ${gameId} was not found`);
                return null;
            }

            const poker = new Poker();
            return poker;
        } catch(err) {
            console.error(`Something happened while trying to get the game with id ${gameId}: ${err}`);
            return null;
        }
    }
}