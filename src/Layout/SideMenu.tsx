import { useState, useEffect } from 'react';
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {HiOutlineHome, HiClipboard, HiUserAdd} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

function SideMenu() {

  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      <Sider theme="light" collapsible collapsed={isMobile ? true : collapsed} onCollapse={onCollapse}>
        <Menu
          onClick={(item) => {
            navigate(item.key)
          }}
          mode="inline"
          items={[
            {
              label: "Home",
              key: "/",
              icon: <HiOutlineHome />
            },
            {
              label: "Admin",
              key: "/admin",
              icon: <HiClipboard />,
              children: [
                {
                  label: "Invite",
                  key: "/invite",
                  icon: <HiUserAdd />
                }
              ]
            }
          ]}
        />
      </Sider>
  )
}

export default SideMenu;