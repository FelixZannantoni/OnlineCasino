export type User = {
    uuid: string,
    username: string,
    displayname: string,
    email: string,
    streakCount: number
}

export type Card = {
    name: string,
    value: number;
    color: string,
    owner: string
}