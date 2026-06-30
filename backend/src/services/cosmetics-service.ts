import { Database } from "better-sqlite3";
import { DB } from "../data";
import { Cosmetic } from "../model";
import { normalizeUserId } from "../utils";

export class CosmeticsService {
    private readonly defaultCosmetics = [
        { id: 1, type: "avatar" },
        { id: 5, type: "card-back" },
        { id: 9, type: "chip" },
        { id: 13, type: "table-felt" }
    ] as const;

    async getCosmeticsByUserId(userId: string | number): Promise<Cosmetic[]> {
        try {
            const connection: Database = await DB.createDBConnection();
            const normalizedUserId = normalizeUserId(userId);

            if (!normalizedUserId) return [];

            this.ensureDefaultCosmetics(connection, normalizedUserId);

            const rows = connection.prepare<{ userId: string }>(`
                SELECT
                    c.id,
                    c.type,
                    c.name,
                    c.price,
                    c.description,
                    c.icon,
                    c.category,
                    c.rarity,
                    c.previewColor1,
                    c.previewColor2,
                    1 as isOwned,
                    uc.is_equipped as isEquipped
                FROM user_cosmetics uc
                JOIN cosmetics c ON c.id = uc.cosmetic_id AND c.type = uc.cosmetic_type
                WHERE uc.user_id = :userId
                ORDER BY c.category, c.price, c.id
            `).all({ userId: normalizedUserId }) as any[];

            return rows.map(row => this.mapCosmetic(row));
        } catch (error) {
            console.error(`Something happened while trying to retrieve cosmetics for userId ${userId}:`, error);
            return [];
        }
    }

    async getAllCosmeticsForUser(userId: string | number): Promise<Cosmetic[]> {
        try {
            const connection = await DB.createDBConnection();
            const normalizedUserId = normalizeUserId(userId);

            if (!normalizedUserId) return [];

            this.ensureDefaultCosmetics(connection, normalizedUserId);

            const rows = connection.prepare<{ userId: string }>(`
                SELECT
                    c.id,
                    c.type,
                    c.name,
                    c.price,
                    c.description,
                    c.icon,
                    c.category,
                    c.rarity,
                    c.previewColor1,
                    c.previewColor2,
                    CASE WHEN uc.user_id IS NULL THEN 0 ELSE 1 END as isOwned,
                    COALESCE(uc.is_equipped, 0) as isEquipped
                FROM cosmetics c
                LEFT JOIN user_cosmetics uc
                    ON c.id = uc.cosmetic_id
                    AND c.type = uc.cosmetic_type
                    AND uc.user_id = :userId
                ORDER BY c.category, c.price, c.id
            `).all({ userId: normalizedUserId }) as any[];

            return rows.map(row => this.mapCosmetic(row));
        } catch (error) {
            console.error(`Something happened while trying to retrieve the cosmetics catalog for userId ${userId}:`, error);
            return [];
        }
    }

    async addCosmeticToUser(userId: string | number, cosmeticId: number, cosmeticType: Cosmetic["type"]): Promise<boolean> {
        try {
            const connection = await DB.createDBConnection();
            const normalizedUserId = normalizeUserId(userId);

            if (!normalizedUserId || !cosmeticId || !cosmeticType) return false;

            const result = connection.prepare(`
                INSERT OR IGNORE INTO user_cosmetics (user_id, cosmetic_id, cosmetic_type, is_equipped)
                VALUES (?, ?, ?, 0)
            `).run(normalizedUserId, cosmeticId, cosmeticType);

            return result.changes >= 0;
        } catch (error) {
            console.error(`Something happened while trying to add cosmetic ${cosmeticType}#${cosmeticId} to userId ${userId}:`, error);
            return false;
        }
    }

    async equipCosmetic(userId: string | number, cosmeticId: number, cosmeticType: Cosmetic["type"]): Promise<boolean> {
        try {
            const connection = await DB.createDBConnection();
            const normalizedUserId = normalizeUserId(userId);

            if (!normalizedUserId || !cosmeticId || !cosmeticType) return false;

            this.ensureDefaultCosmetics(connection, normalizedUserId);

            const ownsCosmetic = connection.prepare(`
                SELECT 1 FROM user_cosmetics
                WHERE user_id = ? AND cosmetic_id = ? AND cosmetic_type = ?
            `).get(normalizedUserId, cosmeticId, cosmeticType);

            if (!ownsCosmetic) return false;

            const transaction = connection.transaction(() => {
                connection.prepare(`
                    UPDATE user_cosmetics
                    SET is_equipped = 0
                    WHERE user_id = ? AND cosmetic_type = ?
                `).run(normalizedUserId, cosmeticType);

                connection.prepare(`
                    UPDATE user_cosmetics
                    SET is_equipped = 1
                    WHERE user_id = ? AND cosmetic_id = ? AND cosmetic_type = ?
                `).run(normalizedUserId, cosmeticId, cosmeticType);
            });

            transaction();
            return true;
        } catch (error) {
            console.error(`Something happened while trying to equip cosmetic ${cosmeticType}#${cosmeticId} for userId ${userId}:`, error);
            return false;
        }
    }

    private ensureDefaultCosmetics(connection: Database, userId: string): void {
        const insert = connection.prepare(`
            INSERT OR IGNORE INTO user_cosmetics (user_id, cosmetic_id, cosmetic_type, is_equipped)
            VALUES (?, ?, ?, 1)
        `);

        for (const cosmetic of this.defaultCosmetics) {
            insert.run(userId, cosmetic.id, cosmetic.type);
        }
    }

    private mapCosmetic(row: any): Cosmetic {
        return {
            id: row.id,
            type: row.type,
            name: row.name,
            price: row.price,
            description: row.description,
            icon: row.icon,
            category: row.category,
            rarity: row.rarity,
            previewColors: [row.previewColor1, row.previewColor2],
            isOwned: Boolean(row.isOwned),
            isEquipped: Boolean(row.isEquipped)
        };
    }
}
