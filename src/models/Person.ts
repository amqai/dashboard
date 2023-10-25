export interface CurrentPerson {
    personId: string,
    email: string,
    status: boolean,
    admin: boolean,
    organizationPermissions: Record<string, string[]>,
}

export interface GetAllPeopleApiResponse {
    people: GetAllPersonApiResponse[],
}

export interface GetAllPersonApiResponse {
    id: string,
    email: string,
    status: string,
    admin: boolean,
    organizations: GetAllPersonOrganizationApiResponse[],
}

export interface GetAllPersonOrganizationApiResponse {
    id: string,
    name: string,
}
