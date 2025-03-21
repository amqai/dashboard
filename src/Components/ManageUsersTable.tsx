import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Drawer, Table, Typography } from "antd";
import {
  GetAllPersonApiResponse,
  GetAllPersonOrganizationApiResponse,
} from "../models/Person";
import { Alert as AlertModel } from "../models/Alert";

const ManageUsersTable: React.FC = () => {
  const [users, setUsers] = useState<GetAllPersonApiResponse[]>();
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [visible, setVisible] = useState(false);
  const [personsOrganizations, setPersonsOrganizations] =
    useState<GetAllPersonApiResponse | null>(null);

  useEffect(() => {
    (async () => {
      refreshTable();
    })();
  }, []);

  const refreshTable = async () => {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/person:all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();
    if (content.people != null) {
      setUsers(...[content.people]);
    }
  };

  const handleDeleteUser = async (personId: string) => {
    const jwt = localStorage.getItem("jwt");
    await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/person?personId=${personId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    ).then((response) => {
      if (response.ok) {
        refreshTable();
      }
    });
  };

  const handleEnableUser = async (personId: string) => {
    const jwt = localStorage.getItem("jwt");
    await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/person?personId=${personId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    ).then((response) => {
      if (response.ok) {
        refreshTable();
      }
    });
  };

  const showDrawer = (record: GetAllPersonApiResponse) => {
    setPersonsOrganizations(record);
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const userColumns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Admin",
      key: "admin",
      render: (_: any, record: GetAllPersonApiResponse) =>
        record.admin === true ? "True" : "False",
    },
    {
      title: "Organizations",
      key: "organizations",
      render: (_: any, record: GetAllPersonApiResponse) => (
        <>
          <a onClick={() => showDrawer(record)} style={{ textDecoration: "none" }}>
            {record.organizations.length}
          </a>
        </>
      ),
    },
    {
      title: "Action",
      key: "id",
      render: (_: any, record: GetAllPersonApiResponse) => (
        <>
          {record.status === "ACTIVE" ? (
            <Button onClick={() => handleDeleteUser(record.id)}>Disable</Button>
          ) : (
            <Button onClick={() => handleEnableUser(record.id)}>Enable</Button>
          )}
        </>
      ),
    },
  ];

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  return (
    <>
      <div className="page-headers" style={{ marginBottom: "10px" }}>
        <div>
          <Typography.Title level={2}>Manage Users</Typography.Title>
          <Typography.Text>Set the status of a user</Typography.Text>
        </div>
      </div>

      <Card bodyStyle={{ overflowX: "scroll" }}>
        {alertMessage !== null && alertMessage.message !== "" && (
          <div style={{ margin: "24px" }}>
            <Alert
              message={alertMessage.message}
              onClose={dismissAlert}
              type={alertMessage.type}
              closable={true}
            />
          </div>
        )}
        <Table dataSource={users} columns={userColumns} />
      </Card>

      <Drawer
        title={`${personsOrganizations?.email}'s Organizations`}
        placement="right"
        onClose={onClose}
        open={visible}
      >
        {personsOrganizations != null && (
          <>
            {personsOrganizations.organizations.map(
              (org: GetAllPersonOrganizationApiResponse) => (
                <p style={{ color: "white" }}>{org.name}</p>
              )
            )}
          </>
        )}
      </Drawer>
    </>
  );
};

export default ManageUsersTable;
