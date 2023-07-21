import { Header } from "antd/es/layout/layout";
import { useContext, useEffect, useState } from "react";
import { Button, Dropdown, MenuProps, Space } from "antd";
import { DownOutlined } from '@ant-design/icons';
import { OrganizationContext } from "./OrganizationProvider";

function AppHeader() {
    const orgContext = useContext(OrganizationContext);
    if(!orgContext) {
      throw new Error("AppHeader must be used within an OrganizationProvider");
    }
    const { orgItems, orgs, setSelectedOrgId } = orgContext;

    const onClick: MenuProps['onClick'] = ({ key }) => {
        setSelectedOrgId(key as string);
        window.location.href = `/organization/${key}/dashboard`;
    };
    const  [organizationName, setOrganizationName] = useState<string>();

    useEffect(() => {
        (
          async () => {
            if (orgs && location.pathname.startsWith("/organization/")) {
                const parts = location.pathname.split('/');
                const organizationIdIndex = parts.indexOf('organization') + 1;
                const organizationId = parts[organizationIdIndex];
                const organization = orgs?.filter(item => item.id === organizationId)[0];
                setOrganizationName(organization.name);
            }
          }
          )();
      });
    

    return (
        <Header className="header" style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                <div className="brand">AMQai</div>
            </div>
            <div style={{justifyContent: "flex-end"}}>
                <Dropdown arrow menu={{ items: orgItems, onClick }}>
                    <Button onClick={(e) => e.preventDefault()}>
                        <Space>
                            {organizationName ? (
                                organizationName
                            ) : (
                                <div>Select Organization</div>
                            )}
                            <DownOutlined />
                        </Space>
                    </Button>
                </Dropdown>
            </div>
        </Header>
    );
}

export default AppHeader;