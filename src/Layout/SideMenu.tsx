import { useState, useEffect, useRef, useContext } from 'react';
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { HiOutlineHome, HiOutlineLogout } from "react-icons/hi";
import { RiOrganizationChart } from "react-icons/ri";
import { FiSettings } from "react-icons/fi";
import { GrDashboard, GrDatabase, GrProjects, GrUserAdmin } from "react-icons/gr";
import { BsChatText, BsPeople } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { OrganizationContext } from './OrganizationProvider';
import { hasPermission } from '../Services/PermissionService';
import { CurrentPerson } from '../models/Person';

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

  const [items, setItems] = useState<{ [key: string]: MenuItem | null }>({
    "/": { label: "Organizations", key: "/", icon: <HiOutlineHome /> },
    "/organization": null,  // placeholder items set to null
    "/admin": null,  // placeholder items set to null
    "/login": { label: "Logout", key: "/login", icon: <HiOutlineLogout /> },
  });

  const itemOrder = ["/", "/organization", "/admin", "/login"]; 

  const location = useLocation();

  let activeLinkParts = location.pathname.split('/');
  // Ensure to only take the first three parts of the URL
  if (activeLinkParts.length > 3) {
    activeLinkParts = activeLinkParts.slice(0, 4);
  }
  const activeLink = activeLinkParts.join('/');

  const isOrganizationAddedRef = useRef(false);
  const [currentPerson, setCurrentPerson] = useState<CurrentPerson | null>(null);

  const orgContext = useContext(OrganizationContext);
  if(!orgContext) {
    throw new Error("SideMenu must be used within an OrganizationProvider");
  }
  const { orgs } = orgContext;

  useEffect(() => {
    if (orgs && location.pathname.startsWith("/organization/") && !isOrganizationAddedRef.current) {
      const parts = location.pathname.split('/');
      const organizationIdIndex = parts.indexOf('organization') + 1;
      const organizationId = parts[organizationIdIndex];

      console.log(orgs);
      const organization = orgs?.filter(item => item.id === organizationId)[0];
      console.log(organization);

      const children = [
      {
        label: "Dashboard",
        key: `/organization/${organizationId}/`,
        icon: <GrDashboard />
      },
      {
        label: "Chat",
        key: `/organization/${organizationId}/chat`,
        icon: <BsChatText />
      },
      {
        label: "Topics",
        key: `/organization/${organizationId}/topics`,
        icon: <GrDatabase />,
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
        icon: <GrProjects />,
        children: children,
      };
      setItems(prevItems => ({
        ...prevItems,
        "/organization": organizationMenuItem,
      }));
      isOrganizationAddedRef.current = true;
    }
  }, [location, orgs]);

  useEffect(() => {
    (
      async () => {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/person/status`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });
        const content = await response.json();
        setCurrentPerson(content);
        localStorage.setItem('super_user', content.admin);
      }
    )();

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

  const isAdminAddedRef = useRef(false);
  useEffect(() => {
    if (currentPerson?.admin && !isAdminAddedRef.current) {
      setItems(prevItems => ({
        ...prevItems,
        "/admin": {
          label: "Admin",
          key: "/admin",
          icon: <GrUserAdmin />,
          children: [
            {
              label: "Organizations",
              key: "/admin/organizations",
              icon: <RiOrganizationChart />
            },
            {
              label: "Allowed Users",
              key: "/admin/invite",
              icon: <BsPeople />
            }
          ],
        },  // fill in the placeholder item
      }));
      isAdminAddedRef.current = true;
    }
  }, [currentPerson]);

  const onCollapse = (collapsed: boolean) => {
    if (!isMobile) {
      setCollapsed(collapsed);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('jwt.expiration');
    navigate('/login')
  }

  return (
    <Sider theme="light" collapsible collapsed={isMobile ? true : collapsed} onCollapse={onCollapse}>
      <Menu
        onClick={(item) => {
          if (item.key === "/") {
            window.location.href = item.key;
          } else if (item.key === "/login") {
            handleLogout();
          } else {
            navigate(item.key)
          }
        }}
        mode="inline"
        items={itemOrder.map(key => items[key]).filter(Boolean)}
        defaultOpenKeys={['/organization']}
        selectedKeys={[activeLink]}
      />
    </Sider>
  )
}

export default SideMenu;