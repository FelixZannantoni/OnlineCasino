import { Database } from "better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import "dotenv/config";
import { readFile } from "fs/promises";
import { EOL } from "os";
import { v4 as generateUUID } from "uuid";
import { hashPassword } from "./utils";

const dbFileName = process.env.DB_FILE_NAME;

export class DB {
    public static createDBConnection(): Database {
        const db = new BetterSqlite3(dbFileName, {
            fileMustExist: false,
            verbose: (stmt) => console.log(stmt)
        });

        db.pragma("foreign_keys = ON");

        this.ensureTablesCreated(db);

        return db;
    }

    private static ensureTablesCreated(connection: Database): void {
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                uuid text PRIMARY KEY,
                userName text UNIQUE,
                socialId text UNIQUE,
                passwordHash text,
                email text,
                displayName text,
                streakCount integer,
                lastOnline text -- Timestamp in ISO format
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS transactions (
                transactionId text PRIMARY KEY,
                userId text,
                amount real,
                date text, -- Timestamp in ISO format
                status text CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
                FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
            )
            `).run();

        this.insertSampleData(connection);
    }

    private static async insertSampleData(connection: Database): Promise<void> {
        const userFilePath: string = process.env.SAMPLE_USER_FILE_PATH ?? "";

        try {
            const fileContent: string = await readFile(userFilePath, { encoding: "utf-8" });
            const lines: string[] = fileContent.split(EOL);
            lines.shift(); // Remove header line

            for(const line of lines) {
                const [username, passwordRaw, email, displayName] = line.split(";");
                const passwordHash: string = await hashPassword(passwordRaw);
                const uuid: string = generateUUID();
                const streakCount: number = 0;
                const lastOnline: string = new Date().toISOString();

                connection.prepare(`INSERT INTO users (uuid, userName, socialId, passwordHash, email, displayName, streakCount,
                    lastOnline) VALUES (:uuid, :username, NULL, :passwordHash, :email, :displayName, :streakCount, :lastOnline)
                `).run({
                    uuid: uuid,
                    username: username,
                    passwordHash: passwordHash,
                    email: email,
                    displayName: displayName,
                    streakCount: streakCount,
                    lastOnline: lastOnline
                });
            }
            
            connection.close();
        } catch(error) {
            console.error("Error inserting sample data:", error);
            connection.close();
        }
    }
}