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
                passwordHash text,
                email text,
                balance real not null default 1000,
                displayName text,
                streakCount integer,
                lastStreakIncrement text, -- Timestamp in ISO format
                isFromGithub integer default 0,
                lastOnline text, -- Timestamp in ISO format
                clubId number default null
            )
            `).run();

        // Migration: Add lastStreakIncrement if missing
        try {
            connection.prepare('ALTER TABLE users ADD COLUMN lastStreakIncrement text').run();
            console.log('DEBUG: Added lastStreakIncrement column to users table');
        } catch (e) {
            // Column likely already exists
        }

        // Migration: Add lastOnline if missing
        try {
            connection.prepare('ALTER TABLE users ADD COLUMN lastOnline text').run();
            console.log('DEBUG: Added lastOnline column to users table');
        } catch (e) {
            // Column likely already exists
        }        connection.prepare(`
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
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS friendship_requests (
                senderId text,
                receiverId text,
                accepted integer, CHECK (accepted IN (0, 1)) -- 0 for pending, 1 for accepted
                PRIMARY KEY (senderId, receiverId),
                FOREIGN KEY (senderId) REFERENCES users(uuid),
                FOREIGN KEY (receiverId) REFERENCES users(uuid)
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS chat_messages (
                id integer PRIMARY KEY AUTOINCREMENT,
                senderId text,
                receiverId text,
                content text,
                timestamp text -- Timestamp in ISO format
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS clubs (
                id integer PRIMARY KEY AUTOINCREMENT,
                name text
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS cosmetics (
                id integer,
                type text CHECK (type IN ('avatar', 'card-back', 'chip', 'table-felt')),
                name text,
                price real,
                description text,
                icon text,
                category text,
                rarity text CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
                previewColor1 text,
                previewColor2 text,
                PRIMARY KEY (id, type)
            )
            `).run();
        connection.prepare(`
            CREATE TABLE IF NOT EXISTS user_cosmetics (
                user_id text,
                cosmetic_id integer,
                cosmetic_type text,
                is_equipped integer not null default 0 CHECK (is_equipped IN (0, 1)),
                PRIMARY KEY (user_id, cosmetic_id, cosmetic_type),
                FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
                FOREIGN KEY (cosmetic_id, cosmetic_type) REFERENCES cosmetics(id, type)
            )
            `).run();

        await this.insertUserSampleData(connection);
        await this.insertGameSampleData(connection);
        await this.insertCosmeticSampleData(connection);
    }

    private static async insertCosmeticSampleData(connection: Database): Promise<void> {
        const cosmetics = [
            [1, "avatar", "Default Avatar", 0, "A clean, classic avatar ring", "person", "avatars", "common", "#9e9e9e", "#616161"],
            [2, "avatar", "Royal Avatar", 500, "Show your royal status at the poker table", "star", "avatars", "epic", "#ce93d8", "#9c27b0"],
            [3, "avatar", "Diamond Avatar", 1000, "Sparkle with every hand you play", "diamond", "avatars", "legendary", "#ffd700", "#e3a812"],
            [4, "avatar", "Dragon Avatar", 1500, "Unleash the dragon at the table", "pets", "avatars", "legendary", "#ff6b6b", "#c92a2a"],
            [5, "avatar", "Shadow Wolf Avatar", 1250, "A cold blue avatar ring for night tables", "nights_stay", "avatars", "rare", "#90caf9", "#0d47a1"],
            [5, "card-back", "Classic Red Card Back", 0, "Timeless classic poker card design", "credit_card", "card-backs", "common", "#c0392b", "#922b21"],
            [6, "card-back", "Midnight Blue Card", 350, "Elegant deep-sea blue finish", "style", "card-backs", "rare", "#1565c0", "#0d47a1"],
            [7, "card-back", "Gold Foil Card", 900, "Luxurious golden shimmer on every card", "auto_awesome", "card-backs", "epic", "#ffd700", "#e3a812"],
            [8, "card-back", "Emerald Grid Card", 650, "A precise green casino grid design", "grid_on", "card-backs", "rare", "#2ecc71", "#0a3d1f"],
            [9, "chip", "Classic Casino Chip", 0, "The original casino feel", "casino", "chip-designs", "common", "#9e9e9e", "#616161"],
            [10, "chip", "Gold Chip Design", 750, "Premium gold-plated chip appearance", "monetization_on", "chip-designs", "epic", "#ffd700", "#e3a812"],
            [11, "chip", "Crystal Chip", 1200, "A glassy cyan chip style", "blur_on", "chip-designs", "legendary", "#b3e5fc", "#00acc1"],
            [12, "chip", "Neon Pulse Chip", 1400, "A glowing chip for high-energy tables", "radio_button_checked", "chip-designs", "legendary", "#00e5ff", "#001f3f"],
            [13, "table-felt", "Classic Green Felt", 0, "The timeless casino table look", "table_restaurant", "table-felts", "common", "#1b5e20", "#2e7d32"],
            [14, "table-felt", "Midnight Black Felt", 500, "Sleek all-black tournament table", "table_restaurant", "table-felts", "rare", "#212121", "#424242"]
        ];

        const insert = connection.prepare(`
            INSERT OR IGNORE INTO cosmetics
            (id, type, name, price, description, icon, category, rarity, previewColor1, previewColor2)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const transaction = connection.transaction(() => {
            for (const cosmetic of cosmetics) {
                insert.run(...cosmetic);
            }
        });

        transaction();
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
                name: "Poker Low",
                type: "POKER"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 2,
                name: "Blackjack Low",
                type: "BLACKJACK"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 3,
                name: "Roulette Low",
                type: "ROULETTE"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 4,
                name: "Blackjack High",
                type: "BLACKJACK"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 5,
                name: "Roulette Middle",
                type: "ROULETTE"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 6,
                name: "Poker Middle",
                type: "POKER"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 7,
                name: "Poker High",
                type: "POKER"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 8,
                name: "Blackjack Middle",
                type: "BLACKJACK"
            });

            await connection.prepare(`INSERT INTO games (gameId, name, type) VALUES (:gameId, :name, :type)`).run({
                gameId: 9,
                name: "Roulette High",
                type: "ROULETTE"
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

                await connection.prepare(`INSERT INTO users (uuid, userName, passwordHash, email, displayName, streakCount, isFromGithub,
                    lastOnline) VALUES (:uuid, :username, :passwordHash, :email, :displayName, :streakCount, :isFromGithub, :lastOnline)
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
