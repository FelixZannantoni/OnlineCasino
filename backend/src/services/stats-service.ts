import { Database } from "better-sqlite3";
import { DB } from "../data";
import { LeaderboardEntry } from "../model";

export class StatsService {
    async onPlayerWin(userId: string): Promise<void> {
        try {
            const connection: Database = await DB.createDBConnection();

            connection.exec(`UPDATE users SET streakCount = 0 WHERE date(lastStreakIncrement) < date('now', '-1 day')`);

            // Update streak when player has not won before today
            const data = connection.prepare<{ uuid: string }, { lastStreakIncrement: string }>(`SELECT lastStreakIncrement FROM users WHERE uuid = :uuid`).get({ uuid: userId });
        
            const lastStreakIncrement = data?.lastStreakIncrement ? new Date(data.lastStreakIncrement) : null;
            const now = new Date();

            if (!lastStreakIncrement || lastStreakIncrement.toDateString() !== now.toDateString()) {
                connection.prepare(`UPDATE users SET streakCount = streakCount + 1, lastStreakIncrement = :now WHERE uuid = :uuid`).run({ 
                    now: now.toISOString(), 
                    uuid: userId 
                });
            }
        } catch (error) {
            console.error(`Something happened while trying to handle player win: ${error}`);
        }
    }

    async getLeaderboard(): Promise<LeaderboardEntry[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            // update streak to 0 when lastStreakIncrement is >= 2 days ago
            connection.exec(`UPDATE users SET streakCount = 0 WHERE date(lastStreakIncrement) < date('now', '-1 day')`);

            // we need rank, username, balance, streak
            const result = connection.prepare<{}, LeaderboardEntry>(`SELECT userName, streakCount AS streak, balance FROM users ORDER BY balance DESC`).all({});
            result.forEach(e => {
                console.log(`User ${e.userName} has a streak of ${e.streak} days.`);
            })
            // we need to add the rank to the result
            return result.map((entry, index) => ({ ...entry, rank: index + 1, avatar: entry.userName.slice(0, 2).toUpperCase() }));
        } catch (error) {
            console.error(`Something happened while trying to retrieve Leaderboard: ${error}`);
            return [];
        }
    }

    async favouriteGame(userId: string, gameId: number): Promise<void> {
        try {
            const connection: Database = await DB.createDBConnection();

            connection.prepare<{ gameId: number, userId: string }>(`INSERT INTO favourite_games (gameId, userId) VALUES (:gameId, :userId)`).run({
                userId,
                gameId
            });
        } catch (error) {
            console.error(`Something happened while trying to favourite game with id ${gameId} for user with id ${userId}`);
        }
    }

    async unFavouriteGame(userId: string, gameId: number): Promise<void> {
        try {
            const connection: Database = await DB.createDBConnection();

            connection.prepare<{ gameId: number, userId: string }>(`DELETE FROM favourite_games WHERE gameId = :gameId AND userId = :userId`).run({
                userId,
                gameId
            });
        } catch (error) {
            console.error(`Something happened while trying to unfavourite game with id ${gameId} for user with id ${userId}`);
        }
    }

    async getFavouriteGames(userId: string): Promise<{gameId: number}[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const games = connection.prepare<{ userId: string }, { gameId: number }>(`SELECT gameId FROM favourite_games WHERE userId = :userId`).all({
                userId
            });

            return games;
        } catch (error) {
            console.error(`Something happened while trying to retrieve favourite games for user with id ${userId}`);
            return [];
        }
    }
}