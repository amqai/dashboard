import { Header } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";
import { Dropdown, Alert } from "antd";
import { OrganizationApiDto } from "../models/Organization";
import { fetchOrganizations } from "../Services/ApiService";
import { Alert as AlertModel, AlertType } from "../models/Alert";
import { CurrentPerson } from "../models/Person";
import { useEffect, useState } from "react";

function AppHeader() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<
    OrganizationApiDto[] | null
  >(null);
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [currentPerson, setCurrentPerson] = useState<CurrentPerson | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState<Boolean>(false);

  useEffect(() => {
    (async () => {
      loadOrganizations();
    })();
  }, []);

  const loadOrganizations = async () => {
    const jwt = localStorage.getItem("jwt");
    const content = await fetchOrganizations(jwt!, false);
    if (content.status === 403) {
      navigate("/login");
    } else if (content.data.errorCode) {
      setAlertMessage({
        message: "There was an error loading your organizations",
        type: AlertType.Error,
      });
    } else {
      setOrganizations(content.data.organizations);
    }
  };

  useEffect(() => {
    (async () => {
      const jwt = localStorage.getItem("jwt");
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/person/status`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const content = await response.json();
      setCurrentPerson(content);
      localStorage.setItem("super_user", content.admin);
    })();
  }, []);

  useEffect(() => {
    if (currentPerson?.admin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [currentPerson]);

  const navigateLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwt.expiration");
    navigate("/login");
  };

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  const handleGoToDashboard = (organizationId: string) => {
    localStorage.setItem("organization.id", organizationId);
    localStorage.setItem(
      "organization.permissions",
      JSON.stringify(currentPerson?.organizationPermissions[organizationId])
    );
    window.location.href = `/organization/${organizationId}/`;
  };

  const organizationItems =
    organizations !== null
      ? organizations.map((organization, index) => ({
          key: index.toString(),
          label: (
            <a
              onClick={() => handleGoToDashboard(organization.id)}
              style={{ textDecoration: "none" }}
            >
              {organization.name}
            </a>
          ),
        }))
      : [];

  const OrganizationDropdown = () => {
    const items = organizationItems;
    return (
      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>Organizations</a>
      </Dropdown>
    );
  };

  const adminItems = [
    {
      key: 1,
      label: (
        <a
          onClick={() => navigate("/admin/organizations")}
          style={{ textDecoration: "none" }}
        >
          Organizations
        </a>
      ),
    },
    {
      key: 2,
      label: (
        <a
          onClick={() => navigate("/admin/manage-users")}
          style={{ textDecoration: "none" }}
        >
          Users
        </a>
      ),
    },
  ];

  const AdminDropdown = () => {
    const items = adminItems;
    return (
      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>Admin</a>
      </Dropdown>
    );
  };

  const settingsItems = [
    {
      key: 1,
      label: (
        <a
          onClick={() => navigate("/profile")}
          style={{ textDecoration: "none" }}
        >
          Profile
        </a>
      ),
    },
    {
      key: 2,
      label: (
        <a onClick={navigateLogout} style={{ textDecoration: "none" }}>
          Logout
        </a>
      ),
    },
  ];

  const SettingsDropdown = () => {
    const items = settingsItems;
    return (
      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>User</a>
      </Dropdown>
    );
  };

  return (
    <Header className="header">
      <div className="brand" onClick={() => navigate("/")} />
      <div className="headerNav">
        <OrganizationDropdown />
        {isAdmin && <AdminDropdown />}
        <SettingsDropdown />
      </div>

      {alertMessage !== null && alertMessage.message !== "" && (
        <div>
          <Alert
            message={alertMessage.message}
            onClose={dismissAlert}
            type={alertMessage.type}
            closable={true}
          />
        </div>
      )}
    </Header>
  );
}

export default AppHeader;
