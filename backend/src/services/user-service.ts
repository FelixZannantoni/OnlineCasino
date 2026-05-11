import { Database } from "better-sqlite3";
import { DB } from "../data";
import { User } from "../model";
import { hashPassword, verifyPassword } from "../utils";

export class UserService {
    // TODO

    async getAllUsers(): Promise<User[]> {
        let result: User[] = [];

        const connection: Database = await DB.createDBConnection();

        result = connection.prepare<{}, User>("SELECT uuid, userName, displayName, email, streakCount FROM users").all({});
        return result;
    }

    async checkUserCredentials(username: string, password: string): Promise<[boolean, string]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const rows = connection.prepare<{username: string}, User>("SELECT * FROM users WHERE userName = :username AND isFromGithub = 0").all({username: username});

            //await connection.close();

            const user: User = rows[0];
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

            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{usernameInput: string, passwordHash: string}, {}>("INSERT INTO users (userName, passwordHash) VALUES (:usernameInput, :passwordHash)").run({
                usernameInput: username,
                passwordHash: pwHash
            });

            // await connection.close();

            if(result.changes === 1) {
                return [true, result.lastInsertRowid.toString()];
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
    async githubLogin(githubId: number, username: string, displayName: string): Promise<boolean> {
        // check for invalid params
        if(!githubId || !username || !displayName) {
            console.error(`Invalid parameters for github login: githubId: ${githubId}, username: ${username}, displayName: ${displayName}`);
            return false;
        }

        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{  }>("SELECT * FROM users WHERE uuid = :githubId AND isFromGithub = 1").all({ githubId: githubId });

            if (result.length > 0) {
                // await connection.close();
                return true;
            }

            // If user doesn't exist, create a new one
            const newUserResult = connection.prepare<{ githubId: number, username: string, displayName: string }>("INSERT INTO users (uuid, userName, displayName, isFromGithub) VALUES (:githubId, :username, :displayName, 1)").run({
                githubId: githubId,
                username: username,
                displayName: displayName
            });

            // await connection.close();

            return newUserResult.changes === 1;

        } catch(err) {
            console.error(`Something happened while trying to login via github (user-service): ${err}`);
            return false;
        }
    }

    /**
     * Gets an user by their userId (uuid in the database)
     * @param userId 
     * @returns an user object if found, null otherwise
     */
    async getUserById(userId: string): Promise<User | null> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{ userId: string }, User>(`SELECT * FROM users WHERE uuid = :userId`)
            .get({ userId: userId});
            return result ?? null;
        } catch (error) {
            console.error(`Something happened while trying to get user by id: ${error}`);
            return null;
        }
    }

    async updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{userId: string, newBalance: number}>("UPDATE users SET balance = :newBalance WHERE uuid = :userId").run({
                userId,
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