import { Database } from "better-sqlite3";
import { ChatMessage } from "../model";
import { DB } from "../data";

export class ChatService {
    /**
     * Retrieves all chat messages for a user
     * @param uuid of the user to retrieve the chats for
     * @returns an array of chat messages or an ampty array, if an error ocurrs
     */
    async getChatMessagesForUser(uuid: string): Promise<ChatMessage[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{ uuid: string }, ChatMessage>(`SELECT * FROM chat_messages WHERE senderId = :uuid OR receiverId = :uuid`)
                                .all({
                                    uuid
                                });
            return result;
        } catch (error) {
            console.error(`Something happened while trying to retrieve chat messages for user with uuid ${uuid}: ${error}`);
            return [];
        }
    }

    /**
     * Sends a message from a user to another
     * @param senderId 
     * @param receiverId 
     * @param content 
     * @returns true if successful, false if not
     */
    async sendMessage(senderId: string, receiverId: string, content: string): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const resultRowsAffected = connection.prepare<{ senderId: string, receiverId: string, content: string, timestampIso: string }>(`INSERT INTO chat_messages (senderId, receiverId, content, timestamp) VALUES
                                (:senderId, :receiverId, :content, :timestampIso)`).run({
                                    senderId,
                                    receiverId,
                                    content,
                                    timestampIso: (new Date()).toISOString()
                                }).changes;
            
            return resultRowsAffected === 1;
        } catch (error) {
            console.error(`Something happened while trying to send a message from user ${senderId} to user ${receiverId}: ${error}`);
            return false;
        }
    }
}