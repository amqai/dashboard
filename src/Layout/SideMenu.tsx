import { useState, useEffect, useRef, useContext } from 'react';
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { HiOutlineHome } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import { AiOutlineDashboard } from "react-icons/ai";
import { GrDatabase, GrProjects, GrUserAdmin } from "react-icons/gr";
import { BsChatText, BsPeople } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { OrganizationContext } from './OrganizationProvider';

interface CurrentPerson {
  personId: string,
  email: string,
  status: boolean,
  admin: boolean
}

function SideMenu() {

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [items, setItems] = useState([
    {
      label: "Home",
      key: "/",
      icon: <HiOutlineHome />
    }
  ]);

  const location = useLocation();
  const activeLink = location.pathname;

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

      const organization = orgs?.filter(item => item.id === organizationId)[0];

      const organizationMenuItem = {
        label: organization.name,
        key: "/organization",
        icon: <GrProjects />,
        children: [
          {
            label: "Dashboard",
            key: `/organization/${organizationId}/dashboard`,
            icon: <AiOutlineDashboard />
          },
          {
            label: "Topics",
            key: `/organization/${organizationId}/topics`,
            icon: <GrDatabase />
          },
          {
            label: "Chat",
            key: `/organization/${organizationId}/chat`,
            icon: <BsChatText />
          },
          {
            label: "Settings",
            key: `/organization/${organizationId}/settings`,
            icon: <FiSettings />
          },
        ]
      };

      setItems(prevItems => [...prevItems, organizationMenuItem]);
      isOrganizationAddedRef.current = true;
    }
  }, [location, orgs]);

  useEffect(() => {
    (
      async () => {
        try {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/person/status`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
          });
          const content = await response.json();
          setCurrentPerson(content);
        } catch (e) {
          navigate('/logout');
        }
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
      setItems(prevItems => [
        ...prevItems,
        {
          label: "Admin",
          key: "/admin",
          icon: <GrUserAdmin />,
          children: [
            {
              label: "Invite",
              key: "/invite",
              icon: <BsPeople />
            }
          ]
        }
      ]);
      isAdminAddedRef.current = true;
    }
  }, [currentPerson]);

  const onCollapse = (collapsed: boolean) => {
    if (!isMobile) {
      setCollapsed(collapsed);
    }
  };

  return (
      <Sider theme="light" collapsible collapsed={isMobile ? true : collapsed} onCollapse={onCollapse}>
        <Menu
          onClick={(item) => {
            navigate(item.key)
          }}
          mode="inline"
          items={items}
          defaultOpenKeys={['/organization']}
          selectedKeys={[activeLink]}
        />
      </Sider>
  )
}

export default SideMenu;