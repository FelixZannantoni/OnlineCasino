import { Database } from "better-sqlite3";
import { DB } from "../data"

export class RoundService {
    async startRound(gameId: string): Promise<number> {
        const connection = await DB.createDBConnection();
        const startTime = new Date().toISOString();

        let numericGameId = parseInt(gameId);

        if (isNaN(numericGameId)) {
            // If gameId is not a number, it's likely a dynamic game (e.g. 'bj-user123')
            // Check if it already exists in the games table
            const existingGame = connection.prepare(`SELECT gameId FROM games WHERE name = ?`).get(gameId) as { gameId: number } | undefined;

            if (existingGame) {
                numericGameId = existingGame.gameId;
            } else {
                // Determine type from prefix
                let type = 'BLACKJACK';
                if (gameId.startsWith('pk-')) type = 'POKER';
                else if (gameId.startsWith('rl-')) type = 'ROULETTE';

                // Create a temporary entry for this dynamic game
                const result = connection.prepare(`INSERT INTO games (name, type)VALUES (?, ?)`).run(gameId, type);
                numericGameId = result.lastInsertRowid as number;
            }
        }

        const result = connection.prepare(`INSERT INTO game_rounds (gameId, startTime, status) VALUES (?, ?, 'OPEN')`).run(numericGameId, (new Date()).toISOString());

        return result.lastInsertRowid as number;
    }

    async recordPlayerBet(roundId: number, userId: string, betAmount: number): Promise<void> {
        if (roundId <= 0) return;
        const connection = await DB.createDBConnection();

        // Check if record exists
        const existing = connection.prepare(`SELECT betAmount FROM player_game_rounds WHERE roundId = ? AND userId = ?`).get(roundId, userId) as { betAmount: number } | undefined;

        if (existing) {
            connection.prepare(`UPDATE player_game_rounds SET betAmount = ? WHERE roundId = ? AND userId = ?`).run(existing.betAmount + betAmount, roundId, userId);
        } else {
            connection.prepare(`INSERT INTO player_game_rounds (roundId, userId, betAmount, profit)VALUES (?, ?, ?, 0)`).run(roundId, userId, betAmount);
        }
    }

    async updatePlayerProfit(roundId: number, userId: string, profit: number): Promise<void> {
        if (roundId <= 0) return;
        const connection = await DB.createDBConnection();
        connection.prepare(`UPDATE player_game_rounds SET profit = ? WHERE roundId = ? AND userId = ?`).run(profit, roundId, userId);
    }

    async endRound(roundId: number): Promise<void> {
        if (roundId <= 0) return;
        const connection = await DB.createDBConnection();
        const endTime = new Date().toISOString();
        connection.prepare(`UPDATE game_rounds SET endTime = ?, status = 'CLOSED' WHERE roundId = ?`).run(endTime, roundId);
    }
}