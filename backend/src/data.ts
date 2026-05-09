import { Database } from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import "dotenv/config";
import { readFile } from "fs/promises";
import { EOL } from "os";
import { v4 as generateUUID } from "uuid";
import { hashPassword } from "./utils";

const dbFileName = process.env.DB_FILE_NAME;

export class DB {

    private static instance: Database;
    private static instancePromise: Promise<Database> | null = null;

    public static async createDBConnection(): Promise<Database> {
        if (this.instancePromise) {
            return this.instancePromise;
        }

        this.instancePromise = (async () => {
            const db = new BetterSqlite3(dbFileName, {
                fileMustExist: false,
                verbose: (stmt) => console.log(stmt)
            });

            db.pragma("foreign_keys = ON");

            await this.ensureTablesCreated(db);

            this.instance = db;
            return db;
        })();

        return this.instancePromise;
    }


    private static async ensureTablesCreated(connection: Database): Promise<void> {
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                uuid text PRIMARY KEY,
                userName text UNIQUE,
                socialId text UNIQUE,
                passwordHash text,
                email text,
                balance real not null default 0,
                displayName text,
                streakCount integer,
                isFromGithub integer, 
                lastOnline text -- Timestamp in ISO format
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS bonuses (
                bonusId integer PRIMARY KEY AUTOINCREMENT,
                userId text,
                type text,
                amount real,
                status text CHECK (status IN ('ACTIVE', 'CLAIMED', 'EXPIRED')),
                FOREIGN KEY (userId) REFERENCES users(uuid) ON DELETE CASCADE
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS games (
                gameId integer PRIMARY KEY AUTOINCREMENT,
                name text,
                type text
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS game_rounds (
                roundId integer PRIMARY KEY AUTOINCREMENT,
                gameId integer,
                startTime text, -- Timestamp in ISO format
                endTime text, -- Timestamp in ISO format
                status text CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
                FOREIGN KEY (gameId) REFERENCES games(gameId)
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS player_game_rounds (
                roundId integer,
                userId text,
                betAmount real,
                profit real,
                PRIMARY KEY (roundId, userId),
                FOREIGN KEY (roundId) REFERENCES game_rounds(roundId),
                FOREIGN KEY (userId) REFERENCES users(uuid)
            )
            `).run();


        await this.insertUserSampleData(connection);
        await this.insertGameSampleData(connection);
    }

    private static async insertGameSampleData(connection: Database): Promise<void> {
        try {
            const gameCount = await connection.prepare("SELECT COUNT(*) as count FROM games").get() as { count: number };

            if (gameCount.count > 0) {
                console.log("Sample game data already inserted!");
                return;
            }

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 1,
                name: "Test Game",
                type: "POKER"
            });

        } catch(err) {
            console.error("Error inserting sample data:", err);
        }
    }

    private static async insertUserSampleData(connection: Database): Promise<void> {
        const userFilePath: string = process.env.SAMPLE_USER_FILE_PATH ?? "";

        try {
            const userCount = await connection.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

            if (userCount.count > 0) {
                console.log("Sample user data already inserted!");
                return;
            }

            const fileContent: string = await readFile(userFilePath, { encoding: "utf-8" });
            const lines: string[] = fileContent.split(EOL);
            lines.shift(); // Remove header line

            for(const line of lines) {
                const [username, passwordRaw, email, displayName] = line.split(";");
                const passwordHash: string = await hashPassword(passwordRaw);
                const uuid: string = generateUUID();
                const streakCount: number = 0;
                const isFromGithub: number = 0;
                const lastOnline: string = new Date().toISOString();

                await connection.prepare(`INSERT INTO users (uuid, userName, socialId, passwordHash, email, displayName, streakCount, isFromGithub,
                    lastOnline) VALUES (:uuid, :username, NULL, :passwordHash, :email, :displayName, :streakCount, :isFromGithub, :lastOnline)
                `).run({
                    uuid: uuid,
                    username: username,
                    passwordHash: passwordHash,
                    email: email,
                    displayName: displayName,
                    streakCount: streakCount,
                    isFromGithub: isFromGithub,
                    lastOnline: lastOnline
                });
            }
            
        } catch(error) {
            console.error("Error inserting sample data:", error);
        }
    }
}