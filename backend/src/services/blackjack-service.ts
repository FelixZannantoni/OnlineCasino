import { Database } from "better-sqlite3";
import { Blackjack } from "../gameLogic/blackjack";
import { BlackjackPlayer } from "../gameLogic/blackjackPlayer";
import { DB } from "../data";

export class BlackjackService {
    static blackjackGames: Blackjack[] = [];

    async hit(playerId: string, gameId: string): Promise<{success: boolean, message: string}> {
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "hit");
    }

    async stand(playerId: string, gameId: string): Promise<{success: boolean, message: string}> {
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "stand");
    }

    async double(playerId: string, gameId: string): Promise<{success: boolean, message: string}> {
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "double");
    }

    async bet(playerId: string, gameId: string, amount: number): Promise<{success: boolean, message: string}> {
        const { game } = this.getGameById(gameId);
        if(!game) return { success: false, message: `Game #${gameId} not found` };
        return game.handlePlayerMove(playerId, "bet", amount);
    }

    async addPlayer(playerId: string, username: string, displayname: string, balance: number, gameId: string): Promise<{success: boolean, message: string}> {
        const gameResult = this.getGameById(gameId);
        if(!gameResult.game) {
            return {
                success: false,
                message: gameResult.message
            };
        }

        const newPlayer: BlackjackPlayer = new BlackjackPlayer(playerId, username, displayname, balance);
        gameResult.game.addPlayer(newPlayer);

        return {
            success: true,
            message: `Successfully added player ${playerId} to game ${gameId}`
        }
    }

    async loadAllBlackjackGames(): Promise<void> {
        try {
            const connection: Database = await DB.createDBConnection();
            const type = "BLACKJACK";

            type GameRow = {
                gameId: string;
                type: string;
            };

            const result = connection.prepare<[string], GameRow>("SELECT * FROM games WHERE type = ?")
                .all(type);

            result.forEach(gameData => {
                const blackjack = new Blackjack(gameData.gameId);
                BlackjackService.blackjackGames.push(blackjack);
            });

            return;
        } catch(err) {
            console.error(`Something happened while trying to get all blackjack games from the db: ${err}`);
            return;
        }
    }

    getGameById(gameId: string): {game: Blackjack | null, message: string} {
        const game: Blackjack | undefined = BlackjackService.blackjackGames.find(g => g.getGameId().toString() === gameId);
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