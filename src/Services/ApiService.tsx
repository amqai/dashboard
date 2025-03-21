import { GetOrganizationFeatureTogglesResponse } from "../models/Wordpress";

export async function fetchOrganizations(jwt: string, superUser: boolean) {
  var response;
  if (superUser) {
    response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/organization:all`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
  } else {
    response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/organization/person`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
  }

  let content = null;
  if (response.status === 403) {
    localStorage.removeItem("jwt");
  } else if (response.ok) {
    content = await response.json();
  }
  return { status: response.status, data: content };
}

export async function fetchTopics(jwt: string, organizationId: string) {
  const response = await fetch(
    `${
      import.meta.env.VITE_APP_API_URL
    }/api/organization:topics?organizationId=${organizationId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  let content = null;
  if (response.status === 403) {
    localStorage.removeItem("jwt");
  } else if (response.ok) {
    content = await response.json();
  }
  return { status: response.status, data: content };
}

export async function fetchFeatureToggles(organizationId: string) {
  const jwt = localStorage.getItem("jwt");
  const response = await fetch(
    `${
      import.meta.env.VITE_APP_API_URL
    }/api/organization/feature?organizationId=${organizationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const content = await response.json();
  const orgFeatureToggles: GetOrganizationFeatureTogglesResponse = content;
  return orgFeatureToggles;
}
