export interface OrganizationApiDto {
  id: string;
  name: string;
  members: Member[];
  ownerId: string;
}

export interface OrganizationsApiDto {
  organizations: OrganizationApiDto[];
}

export interface Member {
  key: string;
  email: string;
  personId: string;
}

export interface OrganizationSettingsApiDto {
  openAiApiKey: string;
  organizationName: string;
  model: string;
  prompt: string;
  temperature: number;
  searchSize: number;
  searchThreshold: number;
  responseSpeedMs: number;
  members: OrganizationMemberApiDto[];
}

interface OrganizationMemberApiDto {
  personId: string;
  email: string;
  permissions: string[];
}
