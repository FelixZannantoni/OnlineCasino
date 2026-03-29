import { Database } from "better-sqlite3";
import { DB } from "../data";
import { User } from "../model";
import { hashPassword, verifyPassword } from "../utils";

export class UserService {

    async getAllUsers(): Promise<User[]> {
        let result: User[] = [];

        const connection: Database = await DB.createDBConnection();

        result = connection.prepare<{}, User>("SELECT uuid, userName, displayName, email, streakCount FROM users").all({});
        return result;
    }

    async checkUserCredentials(username: string, password: string): Promise<[boolean, string]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const rows = connection.prepare<{username: string}, User>("SELECT * FROM users WHERE userName = :username").all({username: username});

            await connection.close();

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

            await connection.close();

            if(result.changes === 1) {
                return [true, result.lastInsertRowid.toString()];
            }
            return [false, "Invalid credentials!"];
        } catch(err) {
            console.error(`Something happened while trying to register user: ${err}`);
            return [false, "-1"];
        }
    }
}