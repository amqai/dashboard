import { Header } from "antd/es/layout/layout";
import { useNavigate } from 'react-router-dom';
import { Dropdown, Alert} from 'antd';
import { OrganizationApiDto } from "../models/Organization";
import { fetchOrganizations } from "../Services/ApiService";
import { Alert as AlertModel, AlertType } from "../models/Alert";
import { useEffect, useState } from "react";

function AppHeader() {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<OrganizationApiDto[] | null>(null);
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);

    useEffect(() => {
        (
            async () => {
                loadOrganizations();
            }
        )();
    },[]);

    const loadOrganizations = async () => {
        const jwt = localStorage.getItem('jwt');
        const content = await fetchOrganizations(jwt!, false);
        if (content.status === 403) {
            navigate("/login");
        } else if (content.data.errorCode) {
            setAlertMessage({
                message: 'There was an error loading your organizations',
                type: AlertType.Error,
              })
        } else {
            setOrganizations(content.data.organizations);
        }
    }

    const items = organizations !== null ? organizations.map((organization, index) => (
        {
            key: index.toString(),
            label: (
                <a onClick={() => navigateOrganization(organization.id)} style={{textDecoration: "none"}}>
                {organization.name}
                </a>
            )
        }
    )) : []

    const navigateOrganization = (id: string) => {
        // call 
        navigate('/organization/' + id)
    }

    const navigateHome = () => {
        navigate(`/`);
    }

    const navigateLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('jwt.expiration');
        navigate('/login')
    }

    const navigateProfile = () => {
        navigate('/profile')
    }

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    return (
        <Header className="header">
            <div className="brand" onClick={navigateHome}/>
            <div className="headerNav">
                <Dropdown menu={{items}}>
                    <a onClick={(e) => e.preventDefault()}>Organizations</a>
                </Dropdown>
                <a href="" onClick={navigateProfile}>Profile</a>
                <a onClick={navigateLogout}>Logout</a>
            </div>

            {alertMessage !== null && alertMessage.message !== "" && (
                <div>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                </div>
            )}
        </Header>
    );
}

export default AppHeader;