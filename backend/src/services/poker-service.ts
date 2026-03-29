import { Database } from "better-sqlite3";
import { Poker } from "../gameLogic/poker";
import { PokerPlayer } from "../gameLogic/pokerPlayer";
import { DB } from "../data";

export class PokerService {
    static pokerGames: Poker[] =  [];


    async fold(playerId: string, gameId: string): Promise<boolean> {
        // get the game and player objects
        console.log(`Looking for game(${gameId}) in: [${PokerService.pokerGames.length}]`)
        const game = PokerService.pokerGames.find(g => g.getGameId());
        console.log(game);
        
        if(!game) return false;

        const player: PokerPlayer | undefined = game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            console.error(`Player with the id ${playerId} was not found in game ${gameId}`);
            console.log(game.getPlayers());
            
            return false;
        }
        player.setPressedFold(true);
        return true;
    }

    async check(playerId: string, gameId: string): Promise<boolean> {
        // get the game and player objects
        const game = PokerService.pokerGames.find(g => g.getGameId());
        
        if(!game) return false;

        const player: PokerPlayer | undefined = game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            console.error(`Player with the id ${playerId} was not found in game ${gameId}`);
            return false;
        }
        player.setPressedCheck(true);
        return true;
    }

    async bet(playerId: string, gameId: string, betAmount: number): Promise<boolean> {
        // get the game and player objects
        const game = PokerService.pokerGames.find(g => g.getGameId());
        
        if(!game) return false;

        const player: PokerPlayer | undefined = game.getPlayers().find(p => p.getPlayerId() === playerId);

        if(!player) {
            console.error(`Player with the id ${playerId} was not found in game ${gameId}`);
            return false;
        }

        const success: boolean = player.setDesiredBet(betAmount);
        if (success) {
            player.setPressedBet(true);
        }

        return success;
    }

    // TODO: implement call and raise

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
        const game = PokerService.pokerGames.find(g => g.getGameId());
        if(!game) return;

        const newPlayer: PokerPlayer = new PokerPlayer(playerId, username, displayname, balance);
        game.addPlayer(newPlayer);
    }

    async loadAllPokerGames(): Promise<void> {
        console.log("Loading games...");
        
        try {
            const connection: Database = await DB.createDBConnection();
            const type = "POKER";

            type GameRow = {
                gameId: string;
                type: string;
            };

            const result = connection.prepare<[string], GameRow>("SELECT * FROM games WHERE type = ?")
                .all(type);
        
            // await connection.close();

            if(!result) {
                throw new Error("FAIL");
            }

            result.forEach(pokergameData => {
                const poker = new Poker(pokergameData.gameId);
                PokerService.pokerGames.push(poker);
            });

            return;
        } catch(err) {
            console.error(`Something happened while trying to get all games from the db: ${err}`);
            return;
        }
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
        
            // await connection.close();

            if(!result) {
                console.error(`Game with the id ${gameId} was not found`);
                return null;
            }

            const poker = new Poker(gameId);
            return poker;
        } catch(err) {
            console.error(`Something happened while trying to get the game with id ${gameId}: ${err}`);
            return null;
        }
    }
}