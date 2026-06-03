import { Database } from "better-sqlite3";
import { DB } from "../data";
import { FriendshipRequest, User, UserDisplay } from "../model";
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

    async getFriendsForUser(userId: string): Promise<UserDisplay[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result: User[] = connection.prepare<{ userId: string }, User>(`SELECT u.* FROM users u JOIN friendship_requests fr ON (u.uuid = fr.senderId OR u.uuid = fr.receiverId) WHERE (fr.senderId = :userId OR fr.receiverId = :userId) AND fr.accepted = 1 AND u.uuid != :userId`).all({ userId: userId });

            return result.map(u => ({
                uuid: u.uuid,
                displayname: u.displayName,
                username: u.userName
            }));
        } catch (error) {
            console.error(`Something happened while trying to retrieve friends for user with id: ${userId}: ${error}`);
            return [];
        }
    }

    async addFriend(userId: string, toUsername: string): Promise<{success: boolean, message: string}> {
        try {
            const connection: Database = await DB.createDBConnection();

            const receiver = connection.prepare<{ username: string }, { uuid: string }>(`SELECT uuid FROM users WHERE userName = :username`).get({ username: toUsername });
            if (!receiver || receiver.uuid === userId) {
                return {
                    success: false,
                    message: 'User not found or cannot send friend request to yourself!'
                };
            }

            // dont allow a request, if there is already an accepted friendship or a pending request between the two users
            const existingRequest = connection.prepare<{ userId: string, receiverId: string }>(`SELECT * FROM friendship_requests WHERE (senderId = :userId AND receiverId = :receiverId) OR (senderId = :receiverId AND receiverId = :userId)`).get({ userId, receiverId: receiver.uuid});
            if (existingRequest) {
                return {
                    success: false,
                    message: 'Friendship request already exists or you are already friends!'
                };
            }

            const result = connection.prepare<{ senderId: string, receiverId: string }>(`INSERT INTO friendship_requests (senderId, receiverId, accepted) VALUES (:senderId, :receiverId, 0)`).run({
                senderId: userId,
                receiverId: receiver.uuid
            }); 

            const success: boolean = result.changes === 1;
            if(success) {
                return {
                    success,
                    message: receiver.uuid
                }
            } else {
                return {
                    success,
                    message: 'Friendship request already sent!'
                }
            }
        } catch (error) {
            console.error(`Something happened while trying to create a friendship request for user with name ${toUsername} from user with id ${userId}: ${error}`);
            return {
                success: false,
                message: 'User not found or friendship request already sent!'
            };
        }
    }

    async acceptFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const result = connection.prepare<{ senderId: string, receiverId: string }>(`UPDATE friendship_requests SET accepted = 1 WHERE senderId = :senderId AND receiverId = :receiverId`).run({ senderId, receiverId });

            return true;
        } catch (error) {
            console.error(`Something happened while trying to accept a friend request from user with id ${senderId} to user with id ${receiverId}: ${error}`);
            return false;
        }
    }

    async removeFriend(userId: string, friendId: string): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const affectedRows: number = connection.prepare<{ userId: string, friendId: string }>(`DELETE FROM friendship_requests WHERE (senderId = :userId AND receiverId = :friendId) OR (senderId = :friendId AND receiverId = :userId)`).run({ userId, friendId }).changes;
            console.log(affectedRows);

            return affectedRows > 0;
        } catch (error) {
            console.error(`Something happened while trying to remove friends ${userId} and ${friendId}: ${error}`);
            return false;
        }
    }

    async getPendingFriendshipRequests(userId: string): Promise<FriendshipRequest[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            // select all pending friendship requests for the user, including the username of the sender and of the receiver
            const result = connection.prepare<{ userId: string }, FriendshipRequest>(`SELECT fr.*, u1.displayName AS senderName, u2.displayName AS receiverName FROM friendship_requests fr JOIN users u1 ON fr.senderId = u1.uuid JOIN users u2 ON fr.receiverId = u2.uuid WHERE fr.accepted = 0 AND (fr.senderId = :userId OR fr.receiverId = :userId)`).all({ userId });
       
            return result;
        } catch (error) {
            console.error(`Something happened while trying to retrieve pending requests for user with id ${userId}: ${error}`);
            return [];
        }
    }
}