import { Database } from "better-sqlite3";
import { v4 as generateUUID } from "uuid";
import { DB } from "../data";
import { FriendshipRequest, User, UserDisplay } from "../model";
import { hashPassword, normalizeUserId, verifyPassword } from "../utils";
import { onlineUsers } from "../app";

export class UserService {

    async getAllUsers(): Promise<User[]> {
        const connection: Database = await DB.createDBConnection();

        const rows: any[] = connection.prepare("SELECT * FROM users").all();
        return rows.map(row => ({
            uuid: row.uuid,
            userName: row.userName,
            displayName: row.displayName,
            email: row.email,
            balance: row.balance,
            streakCount: row.streakCount,
            lastStreakIncrement: row.lastStreakIncrement,
            lastFreeChipsClaim: row.lastFreeChipsClaim,
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

            const result = connection.prepare("INSERT INTO users (uuid, userName, passwordHash, isFromGithub) VALUES (?, ?, ?, 0)").run(
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

    async githubLogin(githubId: string | number, username: string, displayName: string): Promise<{ success: boolean, uuid: string }> {
        const normalizedGithubId = this.normalizeUserId(githubId);

        // check for invalid params
        if (!normalizedGithubId || !username || !displayName) {
            console.error(`Invalid parameters for github login: githubId: ${githubId}, username: ${username}, displayName: ${displayName}`);
            return {
                success: false,
                uuid: ""
            };
        }

        try {
            const connection: Database = await DB.createDBConnection();

            const existingUser = connection.prepare<{}, User>("SELECT * FROM users WHERE uuid = ? AND isFromGithub = 1").get(normalizedGithubId);

            const safeUsername = this.getAvailableGithubUsername(connection, username, normalizedGithubId);

            if (existingUser) {
                if (existingUser.userName !== safeUsername || existingUser.displayName !== displayName) {
                    connection.prepare<{ userId: string, username: string, displayName: string }>(
                        "UPDATE users SET userName = :username, displayName = :displayName WHERE uuid = :userId"
                    ).run({ userId: normalizedGithubId, username: safeUsername, displayName });
                }

                return {
                    success: true,
                    uuid: normalizedGithubId
                };
            }

            // If user doesn't exist, create a new one
            const newUserResult = connection.prepare<{ githubId: string, username: string, displayName: string }>(
                "INSERT INTO users (uuid, userName, displayName, isFromGithub) VALUES (:githubId, :username, :displayName, 1)"
            ).run({
                githubId: normalizedGithubId,
                username: safeUsername,
                displayName: displayName
            });

            // await connection.close();

            if (newUserResult.changes === 1) {
                return {
                    success: true,
                    uuid: normalizedGithubId
                };
            } else {
                return {
                    success: false,
                    uuid: ""
                };
            }

        } catch (err) {
            console.error(`Something happened while trying to login via github (user-service): ${err}`);
            return {
                success: false,
                uuid: ""
            };
        }
    }

    private getAvailableGithubUsername(connection: Database, desiredUsername: string, githubId: string): string {
        let candidate = desiredUsername;
        let suffix = 0;

        while (true) {
            const row = connection.prepare<{ userName: string }, { uuid: string }>(
                "SELECT uuid FROM users WHERE userName = :userName"
            ).get({ userName: candidate });

            if (!row || row.uuid === githubId) {
                return candidate;
            }

            suffix += 1;
            candidate = `${desiredUsername}_${suffix}`;
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

            const result = connection.prepare<{ userId: string }, User>(`SELECT * FROM users WHERE uuid = :userId`)
            .get({ userId: normalizedUserId});
            return result ?? null;
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

    async updateLastFreeChipsClaim(userId: string | number): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();
            const normalizedUserId = this.normalizeUserId(userId);

            if (!normalizedUserId) {
                console.error(`Invalid userId for updateLastFreeChipsClaim: ${userId}`);
                return false;
            }

            const timestamp = new Date().toISOString();
            const result = connection.prepare<{userId: string, timestamp: string}>("UPDATE users SET lastFreeChipsClaim = :timestamp WHERE uuid = :userId").run({
                userId: normalizedUserId,
                timestamp
            });

            return result.changes === 1;
        } catch (error) {
            console.error(`Something happened while trying to update lastFreeChipsClaim for user #${userId}: ${error}`);
            return false;
        }
    }

    async getFriendsForUser(userId: string | number): Promise<UserDisplay[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const normalizedUserId: string = normalizeUserId(userId);

            if (!normalizedUserId) {
                console.error(`Invalid userId for getFriendsForUser: ${userId}`);
                return [];
            }

            const result: User[] = connection.prepare<{ userId: string }, User>(`SELECT u.* FROM users u JOIN friendship_requests fr ON (u.uuid = fr.senderId OR u.uuid = fr.receiverId) WHERE (fr.senderId = :userId OR fr.receiverId = :userId) AND fr.accepted = 1 AND u.uuid != :userId`).all({ userId: normalizedUserId });

            return result.map(u => ({
                uuid: u.uuid,
                displayname: u.displayName,
                username: u.userName,
                status: onlineUsers.get(u.uuid) || "offline"
            }));
        } catch (error) {
            console.error(`Something happened while trying to retrieve friends for user with id: ${userId}: ${error}`);
            return [];
        }
    }

    async addFriend(userId: string | number, toUsername: string): Promise<{success: boolean, message: string}> {
        try {
            const connection: Database = await DB.createDBConnection();

            const normalizedUserId: string = normalizeUserId(userId);

            if (!normalizedUserId) {
                return {
                    success: false,
                    message: `Invalid userId!`
                };
            }

            const receiver = connection.prepare<{ username: string }, { uuid: string }>(`SELECT uuid FROM users WHERE userName = :username`).get({ username: toUsername });
            if (!receiver || receiver.uuid === userId) {
                return {
                    success: false,
                    message: 'User not found or cannot send friend request to yourself!'
                };
            }

            // dont allow a request, if there is already an accepted friendship or a pending request between the two users
            const existingRequest = connection.prepare<{ userId: string, receiverId: string }>(`SELECT * FROM friendship_requests WHERE (senderId = :userId AND receiverId = :receiverId) OR (senderId = :receiverId AND receiverId = :userId)`).get({ userId: normalizedUserId, receiverId: receiver.uuid});
            if (existingRequest) {
                return {
                    success: false,
                    message: 'Friendship request already exists or you are already friends!'
                };
            }

            const result = connection.prepare<{ senderId: string, receiverId: string }>(`INSERT INTO friendship_requests (senderId, receiverId, accepted) VALUES (:senderId, :receiverId, 0)`).run({
                senderId: normalizedUserId,
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

    async acceptFriendRequest(senderId: string | number, receiverId: string | number): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const normalizedSenderId: string = normalizeUserId(senderId);
            const normalizedReceiverId: string = normalizeUserId(receiverId);

            const result = connection.prepare<{ senderId: string, receiverId: string }>(`UPDATE friendship_requests SET accepted = 1 WHERE senderId = :senderId AND receiverId = :receiverId`).run({ senderId: normalizedSenderId, receiverId: normalizedReceiverId });

            return true;
        } catch (error) {
            console.error(`Something happened while trying to accept a friend request from user with id ${senderId} to user with id ${receiverId}: ${error}`);
            return false;
        }
    }

    async removeFriend(userId: string | number, friendId: string | number): Promise<boolean> {
        try {
            const connection: Database = await DB.createDBConnection();

            const normalizedUserId: string = normalizeUserId(userId);
            const normalizedFriendId: string = normalizeUserId(friendId);

            const affectedRows: number = connection.prepare<{ userId: string, friendId: string }>(`DELETE FROM friendship_requests WHERE (senderId = :userId AND receiverId = :friendId) OR (senderId = :friendId AND receiverId = :userId)`).run({ userId: normalizedUserId, friendId: normalizedFriendId }).changes;

            return affectedRows > 0;
        } catch (error) {
            console.error(`Something happened while trying to remove friends ${userId} and ${friendId}: ${error}`);
            return false;
        }
    }

    async getPendingFriendshipRequests(userId: string | number): Promise<FriendshipRequest[]> {
        try {
            const connection: Database = await DB.createDBConnection();

            const normalizedUserId: string = normalizeUserId(userId);

            // select all pending friendship requests for the user, including the username of the sender and of the receiver
            const result = connection.prepare<{ userId: string }, FriendshipRequest>(`SELECT fr.*, u1.displayName AS senderName, u2.displayName AS receiverName FROM friendship_requests fr JOIN users u1 ON fr.senderId = u1.uuid JOIN users u2 ON fr.receiverId = u2.uuid WHERE fr.accepted = 0 AND (fr.senderId = :userId OR fr.receiverId = :userId)`).all({ userId: normalizedUserId });
       
            return result;
        } catch (error) {
            console.error(`Something happened while trying to retrieve pending requests for user with id ${userId}: ${error}`);
            return [];
        }
    }
}