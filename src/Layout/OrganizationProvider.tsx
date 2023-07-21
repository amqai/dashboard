import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { MenuProps } from "antd";
import { OrganizationApiDto } from "../models/Organization";
import { fetchOrganizations } from "../Services/ApiService";
import { useNavigate } from "react-router-dom";

// Define the type of the context data
interface OrganizationContextData {
  orgItems: MenuProps['items'] | undefined;
  orgs: OrganizationApiDto[] | undefined;
  selectedOrgId: string | null;
  setSelectedOrgId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the context
export const OrganizationContext = createContext<OrganizationContextData | undefined>(undefined);

// Define the type of the props for the Provider component
interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [orgItems, setOrgItems] = useState<MenuProps['items']>();
  const [orgs, setOrgs] = useState<OrganizationApiDto[]>();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadOrganizations = async () => {
    const jwt = localStorage.getItem('jwt');
    const content = await fetchOrganizations(jwt!);
    if (content.status === 403) {
      navigate("/login");
    } else if (content.data.errorCode) {
      navigate("/login");
    } else {
      const organizations = content.data.organizations;
      setOrgs(organizations);
      const items = organizations.map((org: OrganizationApiDto) => ({
        label: org.name,
        key: org.id
      }));
      setOrgItems(items);
    }
  }

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <OrganizationContext.Provider value={{ orgItems, orgs, selectedOrgId, setSelectedOrgId }}>
      {children}
    </OrganizationContext.Provider>
  );
};
