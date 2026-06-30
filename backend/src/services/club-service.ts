import { Database } from "better-sqlite3";
import { Club, ClubSummary, UserDisplay } from "../model";
import { DB } from "../data";
import { onlineUsers } from "../app";

const CREATE_CLUB_COST = 10000;

export class ClubService {
    async getAllClubs(): Promise<ClubSummary[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            return connection.prepare<{}, ClubSummary>(`
                SELECT
                    c.id,
                    c.name,
                    COUNT(u.uuid) as memberCount,
                    COALESCE(SUM(u.balance), 0) as totalBalance
                FROM clubs c
                LEFT JOIN users u ON u.clubId = c.id
                GROUP BY c.id, c.name
                ORDER BY memberCount DESC, c.name ASC
            `).all({});
        } catch (error) {
            console.error(`Something happened while trying to retrieve clubs: ${error}`);
            return [];
        }
    }

    async getClubById(clubId: number): Promise<Club | null> {
        try {
            const connection: Database = await DB.createDBConnection();

            const club = connection.prepare<{ clubId: number }, { id: number; name: string }>(`
                SELECT id, name FROM clubs WHERE id = :clubId
            `).get({ clubId });

            if (!club) {
                return null;
            }

            return {
                id: club.id,
                name: club.name,
                members: this.getMembersForClub(connection, club.id)
            };
        } catch (error) {
            console.error(`Something happened while trying to retrieve club with id ${clubId}: ${error}`);
            return null;
        }
    }

    async getClubForPlayer(uuid: string): Promise<Club | null> {
        try {
            const connection: Database = await DB.createDBConnection();

            const club = connection.prepare<{ uuid: string }, { id: number; name: string }>(`
                SELECT c.id, c.name
                FROM users u
                JOIN clubs c ON u.clubId = c.id
                WHERE u.uuid = :uuid
            `).get({ uuid });

            if (!club) {
                return null;
            }

            return {
                id: club.id,
                name: club.name,
                members: this.getMembersForClub(connection, club.id)
            };

        } catch (error) {
            console.log(`Something happened while trying to retrieve club infos for player with id ${uuid}: ${error}`);
            return null;
        }
    }

    async createClub(uuid: string, name: string): Promise<{ success: boolean; message: string; club: Club | null }> {
        try {
            const connection: Database = await DB.createDBConnection();

            const user = connection.prepare<{ uuid: string }, { balance: number; clubId: number | null }>(`
                SELECT balance, clubId FROM users WHERE uuid = :uuid
            `).get({ uuid });

            if (!user) {
                return { success: false, message: "User not found!", club: null };
            }

            if (user.clubId) {
                return { success: false, message: "User is already in a club!", club: null };
            }

            if (user.balance < CREATE_CLUB_COST) {
                return { success: false, message: "Not enough balance to create a club!", club: null };
            }

            const trimmedName = name.trim();
            if (trimmedName.length < 3) {
                return { success: false, message: "Club name is too short!", club: null };
            }

            const create = connection.transaction(() => {
                const result = connection.prepare<{ name: string }>(`
                    INSERT INTO clubs (name) VALUES (:name)
                `).run({ name: trimmedName });

                const clubId = Number(result.lastInsertRowid);

                connection.prepare<{ clubId: number; uuid: string; cost: number }>(`
                    UPDATE users
                    SET clubId = :clubId, balance = balance - :cost
                    WHERE uuid = :uuid
                `).run({ clubId, uuid, cost: CREATE_CLUB_COST });

                return clubId;
            });

            const clubId = create();
            const club = await this.getClubById(clubId);

            return { success: true, message: "Club created!", club };
        } catch (error) {
            console.error(`Something happened while trying to create club ${name} for player with id ${uuid}: ${error}`);
            return { success: false, message: "Club could not be created!", club: null };
        }
    }

    async joinClub(uuid: string, clubId: number): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const club = connection.prepare<{ clubId: number }, { id: number }>(`
                SELECT id FROM clubs WHERE id = :clubId
            `).get({ clubId });

            if (!club) {
                return false;
            }

            const result = connection.prepare<{ clubId: number, uuid: string}>(`
                UPDATE users SET clubId = :clubId WHERE uuid = :uuid
            `).run({
                clubId,
                uuid
            });

            return result.changes === 1;
        } catch (error) {
            console.error(`Something happened while trying to join player with id ${uuid} to club with id ${clubId}: ${error}`);
            return false;
        }
    }

    async leaveClub(uuid: string): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{ uuid: string }>(`
                UPDATE users SET clubId = NULL WHERE uuid = :uuid
            `).run({ uuid });

            return result.changes === 1;
        } catch (error) {
            console.error(`Something happened while trying to remove player with id ${uuid} from their club: ${error}`);
            return false;
        }
    }

    private getMembersForClub(connection: Database, clubId: number): UserDisplay[] {
        const members = connection.prepare<{ clubId: number }, UserDisplay>(`
            SELECT
                uuid,
                userName as username,
                COALESCE(displayName, userName) as displayname
            FROM users
            WHERE clubId = :clubId
            ORDER BY displayname COLLATE NOCASE ASC
        `).all({ clubId });

        return members.map(member => ({
            ...member,
            status: onlineUsers.get(member.uuid) || "offline"
        }));
    }
}
