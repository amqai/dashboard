export interface CurrentPerson {
    personId: string,
    email: string,
    status: boolean,
    admin: boolean,
    permissions: string[],
}