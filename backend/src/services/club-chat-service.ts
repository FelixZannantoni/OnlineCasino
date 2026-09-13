import { Database } from "better-sqlite3";
import { ClubChatMessage } from "../model";
import { DB } from "../data";

export class ClubChatService {
    async getClubChatMessages(clubId: number): Promise<ClubChatMessage[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            return connection.prepare<{ clubId: number }, ClubChatMessage>(`
                SELECT
                    id,
                    senderId,
                    senderName,
                    clubId,
                    content,
                    timestamp
                FROM club_chat_messages
                WHERE clubId = :clubId
                ORDER BY timestamp ASC
            `).all({ clubId });
        } catch (error) {
            console.error(`Something happened while trying to retrieve chat messages for club ${clubId}: ${error}`);
            return [];
        }
    }

    async sendMessage(clubId: number, senderId: string, senderName: string, content: string): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{
                clubId: number;
                senderId: string;
                senderName: string;
                content: string;
            }>(`
                INSERT INTO club_chat_messages (clubId, senderId, senderName, content, timestamp)
                VALUES (:clubId, :senderId, :senderName, :content, datetime('now'))
            `).run({
                clubId,
                senderId,
                senderName,
                content
            });

            return result.changes === 1;
        } catch (error) {
            console.error(`Something happened while trying to send message to club ${clubId}: ${error}`);
            return false;
        }
    }

    async cleanupOldMessages(): Promise<void> {
        try {
            const connection: Database = await DB.createDBConnection();

            // Keep messages for 30 days
            connection.prepare(`
                DELETE FROM club_chat_messages
                WHERE timestamp < datetime('now', '-30 days')
            `).run();
        } catch (error) {
            console.error(`Something happened while trying to cleanup old chat messages: ${error}`);
        }
    }
}