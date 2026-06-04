import { Database } from "better-sqlite3";
import { Roulette } from "../gameLogic/roulette";
import { RoulettePlayer } from "../gameLogic/roulettePlayer";
import { DB } from "../data";

export class RouletteService {
    static rouletteGames: Roulette[] = [];

    async bet(playerId: string, gameId: string, amount: number, field: string): Promise<{success: boolean, message: string}> {
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return await game.handlePlayerMove(playerId, "bet", amount, field);
    }

    async spin(playerId: string, gameId: string): Promise<{success: boolean, message: string}> {
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return await game.handlePlayerMove(playerId, "spin");
    }

    async addPlayer(playerId: string, username: string, displayname: string, balance: number, gameId: string): Promise<{success: boolean, message: string}> {
        const gameResult = this.getGameById(gameId);
        if(!gameResult.game) {
            return {
                success: false,
                message: gameResult.message
            };
        }

        const newPlayer: RoulettePlayer = new RoulettePlayer(playerId, username, displayname, balance);
        gameResult.game.addPlayer(newPlayer);

        return {
            success: true,
            message: `Successfully added player ${playerId} to game ${gameId}`
        }
    }

    async loadAllRouletteGames(): Promise<void> {
        try {
            const connection: Database = await DB.createDBConnection(); console.log("DEBUG: DB Connection successful");
            const type = "ROULETTE";

            console.log("DEBUG: Attempting to load Roulette games from DB...");
            
            type GameRow = {
                gameId: number;
                type: string;
            };

            const result = connection.prepare<[string], GameRow>("SELECT * FROM games WHERE type = ?")
                .all(type);

            console.log("DEBUG: Query result:", JSON.stringify(result));

            if (result.length === 0) {
                console.log("DEBUG: No Roulette games found in DB, manually creating one.");
                const roulette = new Roulette("3");
                RouletteService.rouletteGames.push(roulette);
            } else {
                result.forEach(gameData => {
                    console.log("DEBUG: Initializing Roulette game with ID:", gameData.gameId);
                    const roulette = new Roulette(gameData.gameId.toString()); console.log("DEBUG: Created Roulette game instance with ID:", gameData.gameId.toString());
                    RouletteService.rouletteGames.push(roulette);
                });
            }

            console.log("DEBUG: Total roulette games loaded:", RouletteService.rouletteGames.length);
            return;
        } catch(err) {
            console.error(`Something happened while trying to get all roulette games from the db: ${err}`);
            return;
        }
    }

    getGameById(gameId: string): {game: Roulette | null, message: string} {
        const game: Roulette | undefined = RouletteService.rouletteGames.find(g => g.getGameId().toString() === gameId);
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