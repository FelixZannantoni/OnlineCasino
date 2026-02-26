import { Database } from "better-sqlite3";
import { DB } from "../data";
import { User } from "../model";

export class UserService {
    // TODO

    async getAllUsers(): Promise<User[]> {
        let result: User[] = [];

        const connection: Database = await DB.createDBConnection();

        result = connection.prepare<{}, User>("SELECT uuid, userName, displayName, email, streakCount FROM users").all({});
        return result;
    }
}