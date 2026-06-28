import { Database } from "better-sqlite3";
import { Club, UserDisplay } from "../model";
import { DB } from "../data";

export class ClubService {
    async getClubForPlayer(uuid: string): Promise<Club | null> {
        try {
            const connection: Database = await DB.createDBConnection();

            // Club des Spielers holen
            const club = connection.prepare<{ uuid: string }, { id: number; name: string }>(`SELECT c.id, c.name FROM users u JOIN clubs c ON u.clubId = c.id WHERE u.uuid = :uuid
            `).get({ uuid });

            if (!club) {
                return null;
            }

            // Mitglieder des Clubs holen
            const members = connection.prepare<{ clubId: number }, UserDisplay>(`
                SELECT
                    uuid,
                    displayName,
                    userName
                FROM users
                WHERE clubId = :clubId
            `).all({ clubId: club.id });

            return {
                id: club.id,
                name: club.name,
                members
            };

        } catch (error) {
            console.log(`Something happened while trying to retrieve club infos for player wiht id ${uuid}: ${error}`);
            return null;
        }
    }

    async joinClub(uuid: string, clubId: number): Promise<void> {
        try {
            const connection: Database = await DB.createDBConnection();

            connection.prepare<{ clubId: number, uuid: string}>(`UPDATE users u SET clubId = :clubId WHERE uuid = :uuid`).run({
                clubId,
                uuid
            });
        } catch (error) {
            console.error(`Something happened while trying to join player with id ${uuid} to club with id ${clubId}: ${error}`);
        }
    }
}