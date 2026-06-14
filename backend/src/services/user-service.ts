import { Database } from "better-sqlite3";
import { v4 as generateUUID } from "uuid";
import { DB } from "../data";
import { User } from "../model";
import { hashPassword, verifyPassword } from "../utils";

export class UserService {

    async getAllUsers(): Promise<User[]> {
        const connection: Database = await DB.createDBConnection();

        const rows: any[] = connection.prepare("SELECT * FROM users").all();
        return rows.map(row => ({
            uuid: row.uuid,
            username: row.userName,
            displayname: row.displayName,
            email: row.email,
            balance: row.balance,
            streakCount: row.streakCount,
            lastStreakIncrement: row.lastStreakIncrement,
            passwordHash: row.passwordHash
        }));
    }

    async checkUserCredentials(username: string, password: string): Promise<[boolean, string]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const rows: any[] = connection.prepare("SELECT uuid, passwordHash FROM users WHERE userName = ? AND isFromGithub = 0").all(username);

            const user = rows[0];
            if(!user) return [false, "-1"];

            const passwordHash = user.passwordHash;

            return[await verifyPassword(password, passwordHash), user.uuid];

        } catch(err) {
            console.error(`Somehting happened while trying to check user credentials: ${err}`);
            return [false, "-1"];
        }
    }
    async registerUser(username: string, password: string): Promise<[boolean, string]> {
        try {
            const pwHash: string = await hashPassword(password);
            const uuid: string = generateUUID();

            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare("INSERT INTO users (uuid, userName, passwordHash) VALUES (?, ?, ?)").run(
                uuid,
                username,
                pwHash
            );

            // await connection.close();

            if(result.changes === 1) {
                return [true, uuid];
            }
            return [false, "Invalid credentials!"];
        } catch(err) {
            console.error(`Something happened while trying to register user: ${err}`);
            return [false, "-1"];
        }
    }

    /**
     * Tries to log in a user via github. If the user doesn't exist, it will be created.
     * @param githubId githubId of the user
     * @param name github name of the user
     * @returns true if login (or registration) was successful, false otherwise
     */
    private normalizeUserId(userId: string | number): string {
        if (typeof userId === "number") {
            if (!Number.isFinite(userId)) return "";
            return String(Math.trunc(userId));
        }

        if (typeof userId === "string") {
            return userId.replace(/\.0+$/, "");
        }

        return "";
    }

    async githubLogin(githubId: string | number, username: string, displayName: string): Promise<boolean> {
        const normalizedGithubId = this.normalizeUserId(githubId);

        // check for invalid params
        if (!normalizedGithubId || !username || !displayName) {
            console.error(`Invalid parameters for github login: githubId: ${githubId}, username: ${username}, displayName: ${displayName}`);
            return false;
        }

        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare("SELECT * FROM users WHERE uuid = ? AND isFromGithub = 1").all(normalizedGithubId);

            if (result.length > 0) {
                // await connection.close();
                return true;
            }

            // If user doesn't exist, create a new one
            const newUserResult = connection.prepare("INSERT INTO users (uuid, userName, displayName, isFromGithub) VALUES (?, ?, ?, 1)").run(
                normalizedGithubId,
                username,
                displayName
            );

            // await connection.close();

            return newUserResult.changes === 1;

        } catch (err) {
            console.error(`Something happened while trying to login via github (user-service): ${err}`);
            return false;
        }
    }

    /**
     * Gets an user by their userId (uuid in the database)
     * @param userId 
     * @returns an user object if found, null otherwise
     */
    async getUserById(userId: string | number): Promise<User | null> {
        try {
            const connection: Database = await DB.createDBConnection();
            const normalizedUserId = this.normalizeUserId(userId);

            if (!normalizedUserId) return null;

            // First try by uuid
            let row: any = connection.prepare(`SELECT * FROM users WHERE uuid = ?`).get(normalizedUserId);
            
            // If not found, try by userName (just in case frontend sends username)
            if (!row) {
                row = connection.prepare(`SELECT * FROM users WHERE userName = ?`).get(userId);
            }

            if (!row) return null;

            return {
                uuid: row.uuid,
                username: row.userName,
                displayname: row.displayName,
                email: row.email,
                balance: row.balance,
                streakCount: row.streakCount,
                lastStreakIncrement: row.lastStreakIncrement,
                passwordHash: row.passwordHash
            };
        } catch (error) {
            console.error(`Something happened while trying to get user by id: ${error}`);
            return null;
        }
    }

    async updateUserBalance(userId: string | number, newBalance: number): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();
            const normalizedUserId = this.normalizeUserId(userId);

            if (!normalizedUserId) {
                console.error(`Invalid userId for updateUserBalance: ${userId}`);
                return false;
            }

            const result = connection.prepare<{userId: string, newBalance: number}>("UPDATE users SET balance = :newBalance WHERE uuid = :userId").run({
                userId: normalizedUserId,
                newBalance
            });

            const success: boolean = result.changes === 1;
            return success;
        } catch (error) {
            console.error(`Something happened while trying to update user balance for user #${userId}: ${error}`);
            return false;
        }
    }
}