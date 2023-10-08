export interface CurrentPerson {
    personId: string,
    email: string,
    status: boolean,
    admin: boolean,
    organizationPermissions: Record<string, string[]>,
  }