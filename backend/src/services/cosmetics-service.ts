import { Database } from "better-sqlite3";
import { DB } from "../data";
import { Cosmetic } from "../model";

export class CosmeticsService {
    async getCosmeticsByUserId(userId: string): Promise<Cosmetic[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{}, Cosmetic>(`SELECT * FROM user_cosmetics WHERE user_id = ?`).all(userId);
            return result;
        } catch (error) {
            console.error(`Something happened while trying to retrieve cosmetics for userId ${userId}:`, error);
            return [];
        }
    }
}