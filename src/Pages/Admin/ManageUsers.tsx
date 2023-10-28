import "../../styles/common.css";
import ManageUsersTable from "../../Components/ManageUsersTable";
import WhiteListUsersTable from "../../Components/WhiteListUsersTable";
import { Tabs } from "antd";
import TabPane from "antd/es/tabs/TabPane";
import { useState } from "react";

function ManageUsers() {

    const [activeKey, setActiveKey] = useState(localStorage.getItem('admin.manage_users_page.activeTabKey') || "1");

    return (
        <div className="center-wrapper">
            <Tabs
            defaultActiveKey="1"
            activeKey={activeKey}
            onChange={(newActiveKey) => {
                setActiveKey(newActiveKey);
                localStorage.setItem('admin.manage_users_page.activeTabKey', newActiveKey);
            }}
            >
                <TabPane 
                    tab="Users"
                    key="1"
                >
                    <ManageUsersTable />
                </TabPane>

                <TabPane
                    tab="White List"
                    key="2"
                >
                    <WhiteListUsersTable />
                </TabPane>
            </Tabs>
        </div>
    );
}

export default ManageUsers;