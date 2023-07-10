import { useState, useEffect, useRef } from 'react';
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { HiOutlineHome } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import { AiOutlineDashboard } from "react-icons/ai";
import { GrDatabase, GrProjects, GrUserAdmin } from "react-icons/gr";
import { BsUpload, BsChatText, BsPeople } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";

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

  const isProjectAddedRef = useRef(false);
  const [currentPerson, setCurrentPerson] = useState<CurrentPerson | null>(null);

  useEffect(() => {
    if (location.pathname.startsWith("/project/") && !isProjectAddedRef.current) {
      const parts = location.pathname.split('/');
      const projectIdIndex = parts.indexOf('project') + 1;
      const projectId = parts[projectIdIndex];

      const projectMenuItem = {
        label: "Project",
        key: "/project",
        icon: <GrProjects />,
        children: [
          {
            label: "Dashboard",
            key: `/project/${projectId}/dashboard`,
            icon: <AiOutlineDashboard />
          },
          {
            label: "Data",
            key: `/project/${projectId}/data`,
            icon: <GrDatabase />
          },
          {
            label: "Upload",
            key: `/project/${projectId}/upload`,
            icon: <BsUpload />
          },
          {
            label: "Prompt",
            key: `/project/${projectId}/prompt`,
            icon: <BsChatText />
          },
          {
            label: "Settings",
            key: `/project/${projectId}/settings`,
            icon: <FiSettings />
          },
        ]
      };

      setItems(prevItems => [...prevItems, projectMenuItem]);
      isProjectAddedRef.current = true;
    }
  }, [location]);

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
        />
      </Sider>
  )
}

export default SideMenu;