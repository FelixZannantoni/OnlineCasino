export type User = {
    uuid: string,
    username: string,
    displayname: string,
    email: string,
    streakCount: number,
    passwordHash: string
}

export type Card = {
    name: string,
    value: number;
    color: string,
    owner: string
}