import { DB } from "../data";
import { User } from "../model";

export class UserService {
    // TODO

    getAllUsers(): User[] {
        let result: User[] = [];

        const connection = DB.createDBConnection();

        result = connection.prepare<{}, User>("SELECT uuid, userName, displayName, email, streakCount FROM users").all({});
        return result;
    }
}