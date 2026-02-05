export interface UserWithoutPassword {
    username: string,
    email: string,
    id: string
}

export interface TokenPayload {
    sub: string,
    username: string
}
