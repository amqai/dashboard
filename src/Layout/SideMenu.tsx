import { useState, useEffect } from 'react';
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { FiSettings } from "react-icons/fi";
import { AiOutlineDashboard, AiOutlineDatabase } from "react-icons/ai";
import { BsChatText } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { hasPermission } from '../Services/PermissionService';

type MenuItem = {
  label: string,
  key: string,
  icon: JSX.Element,
};

function SideMenu() {

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const location = useLocation();

  let activeLinkParts = location.pathname.split('/');
  if (activeLinkParts.length > 3) {
    activeLinkParts = activeLinkParts.slice(0, 4);
  }
  const activeLink = activeLinkParts.join('/');

  useEffect(() => {
    if (location.pathname.startsWith("/organization/")) {
      const parts = location.pathname.split('/');
      const organizationIdIndex = parts.indexOf('organization') + 1;
      const organizationId = parts[organizationIdIndex];

      const newItems = [
        {
          label: "Home",
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
        }
      ];

      if (hasPermission("MANAGE_ORGANIZATION")) {
        newItems.push({
          label: "Settings",
          key: `/organization/${organizationId}/settings`,
          icon: <FiSettings />
        });
      }

      setItems(newItems);
      setIsMenuVisible(true);

    } else {
      setItems([]);
      setIsMenuVisible(false);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setCollapsed(window.innerWidth < 768);
    };

    handleResize();
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
        onClick={(item) => navigate(item.key)}
        mode="inline"
        items={items}
        defaultOpenKeys={['/organization']}
        selectedKeys={[activeLink]}
        style={{ 
          height: "100vh",
          border: "none",
          padding: "10px",
        }}
      />
    </Sider>
  )
}

export default SideMenu;
