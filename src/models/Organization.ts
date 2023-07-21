export interface OrganizationApiDto {
    id: string,
    name: string,
    members: string[],
    ownerId: string,
}

export interface OrganizationsApiDto {
    organizations: OrganizationApiDto[],
}