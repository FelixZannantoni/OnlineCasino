import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
    const SALT_ROUNDS = 12;

    if (typeof password !== "string" || password.length === 0) {
        throw new Error("Password must be a non-empty string");
    }

    return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    if (typeof password !== "string" || password.length === 0) {
        throw new Error("Password must be a non-empty string");
    }

    return await bcrypt.compare(password, hash);
}