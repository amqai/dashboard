import { useState, useEffect, useContext } from 'react';
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { FiSettings } from "react-icons/fi";
import { GoOrganization } from "react-icons/go"
import { AiOutlineDashboard, AiOutlineDatabase } from "react-icons/ai"
import { BsChatText } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { OrganizationContext } from './OrganizationProvider';
import { hasPermission } from '../Services/PermissionService';

type MenuItem = {
  label: string,
  key: string,
  icon: JSX.Element,
  children?: MenuItem[],
};

function SideMenu() {

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState<{ [key: string]: MenuItem | null }>({});
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const itemOrder = ["/organization"]; 
  const location = useLocation();

  let activeLinkParts = location.pathname.split('/');
  // Ensure to only take the first three parts of the URL
  if (activeLinkParts.length > 3) {
    activeLinkParts = activeLinkParts.slice(0, 4);
  }
  const activeLink = activeLinkParts.join('/');

  const orgContext = useContext(OrganizationContext);
  if(!orgContext) {
    throw new Error("SideMenu must be used within an OrganizationProvider");
  }
  const { orgs } = orgContext;

  useEffect(() => {
    if (orgs && location.pathname.startsWith("/organization/" )) {
      const parts = location.pathname.split('/');
      const organizationIdIndex = parts.indexOf('organization') + 1;
      const organizationId = parts[organizationIdIndex];
      const organization = orgs?.filter(item => item.id === organizationId)[0];
      const children = [
      {
        label: "Dashboard",
        key: `/organization/${organizationId}/`,
        icon: <AiOutlineDashboard />
      },
      {
        label: "Chat",
        key: `/organization/${organizationId}/chat`,
        icon: <BsChatText />
      },
      {
        label: "Topics",
        key: `/organization/${organizationId}/topics`,
        icon: <AiOutlineDatabase />,
      }];

      if (hasPermission("MANAGE_ORGANIZATION")) {
        children.push({
          label: "Settings",
          key: `/organization/${organizationId}/settings`,
          icon: <FiSettings />
        });
      }

      const organizationMenuItem: MenuItem = {
        label: organization.name,
        key: "/organization",
        icon: <GoOrganization />,
        children: children,
      };

      setItems(prevItems => ({
        ...prevItems,
        "/organization": organizationMenuItem,
      }));
      setIsMenuVisible(true)

    } else {
      const emptyItems: { [key: string]: MenuItem | null } = {};
      setItems(emptyItems);
      setIsMenuVisible(false)
    }
  }, [location, orgs]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);  // breakpoint at which to collapse the Sider
      setCollapsed(window.innerWidth < 768);
    };

    handleResize();  // collapse if page starts in a small window
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  const onCollapse = (collapsed: boolean) => {
    if (!isMobile) {
      setCollapsed(collapsed);
    }
  };

  return (
    <Sider 
    theme="light"
    collapsible collapsed={isMobile ? true : collapsed}
    onCollapse={onCollapse}
    width={isMenuVisible ? '200px' : "0px"}
    >
      <Menu
        onClick={(item) => {
          if (item.key === "/") {
            window.location.href = item.key;
          } else {
            navigate(item.key)
          }
        }}
        mode="inline"
        items={itemOrder.map(key => items[key]).filter(Boolean)}
        defaultOpenKeys={['/organization']}
        selectedKeys={[activeLink]}
        style={{height: "100vh", border: "none", padding: "10px"}}
      />
    </Sider>
  )
}

export default SideMenu;