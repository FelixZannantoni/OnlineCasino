import { Database } from "better-sqlite3";
import { Poker } from "../gameLogic/poker";
import { PokerPlayer } from "../gameLogic/pokerPlayer";
import { DB } from "../data";

export class PokerService {
    static pokerGames: Poker[] =  [];


    async fold(playerId: string, gameId: string): Promise<boolean> {
        // get the game and player objects
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "fold");
    }

    async check(playerId: string, gameId: string): Promise<boolean> {
        // get the game and player objects
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "check");
    }

    async bet(playerId: string, gameId: string, betAmount: number): Promise<boolean> {
        // get the game and player objects
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "bet", betAmount);
    };

    call(playerId: string, gameId: string): {success: boolean, message: string} {
        // get the game and player objects
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "call");
    }

    raise(playerId: string, gameId: string, raiseAmount: number): {success: boolean, message: string} {
        // get the game and player objects
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "raise", raiseAmount);
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
        const gameResult = this.getGameById(gameId);
        if(!gameResult.game) { 
            console.log(gameResult.message);
            return {
                success: false,
                message: gameResult.message
            };
        }

        const newPlayer: PokerPlayer = new PokerPlayer(playerId, username, displayname, balance);
        gameResult.game.addPlayer(newPlayer);

        if(gameResult.game.getPlayers().length === 1) {
            gameResult.game.setDefaultDealerChip();
        }

        return {
            success: true,
            message: `Successfully added player ${playerId} to game ${gameId}`
        }
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

    getGameById(gameId: string): {game: Poker | null, message: string} {
        const game: Poker | undefined = PokerService.pokerGames.find(g => g.getGameId().toString() === gameId);
        console.log(`${typeof gameId} vs ${typeof PokerService.pokerGames[0].getGameId()}`);
        if(!game) {
            return {
                game: null,
                message: `Game with the id ${gameId} was not found`
            };
        } else {
            return {
                game,
                message: "Game found"
            };
        }
    }
}