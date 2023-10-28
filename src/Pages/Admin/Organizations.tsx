import { useEffect, useState } from "react";
import { Table, Card, Alert, Modal } from "antd";
import { Alert as AlertModel } from "../../models/Alert";
import "../../styles/common.css";
import { Member, OrganizationApiDto } from "../../models/Organization";
import { useNavigate } from "react-router-dom";
import FeatureToggleList from "../../Components/FeatureToggleList";
import OrganizationMembersList from "../../Components/OrganizationMembersList";

function Organizations() {
    const [organizations, setOrganizations] = useState<OrganizationApiDto[]>()
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
    const navigate = useNavigate();
    const [isFeatureModalVisible, setIsFeatureModalVisible] = useState(false);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
    const [isOrganizationMembersModalVisible, setIsOrganizationMembersModalVisible] = useState(false);

    const handleFeaturesClick = (organizationId: string) => {
        setSelectedOrganizationId(organizationId);
        setIsFeatureModalVisible(true);
    };

    const handleFeatureModalClose = () => {
        setIsFeatureModalVisible(false);
    };

    const goToSettings = (organizationId: string) => {
        navigate(`/organization/${organizationId}/settings`)
    }

    const goToOrganizationDashboard = (organizationId: string) => {
        localStorage.setItem('organization.id', organizationId)
        localStorage.setItem('organization.permissions', JSON.stringify(["READ", "MANAGE_DATA", "CREATE_TOPICS", "UPLOAD_DATA", "MANAGE_ORGANIZATION", "MANAGE_INTEGRATIONS"]));
        navigate(`/organization/${organizationId}/`);
    }

    const handleOrganizationMembersClick = (organizationId: string) => {
        setSelectedOrganizationId(organizationId);
        setIsOrganizationMembersModalVisible(true);
    };

    const handleOrganizationMembersModalClose = () => {
        setIsOrganizationMembersModalVisible(false);
    }

    useEffect(() => {
        (
            async () => {
                const jwt = localStorage.getItem('jwt');
                const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization:all`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                }
                });

                const content = await response.json();
                if(content != null && content.organizations != null) {
                    setOrganizations(...[content.organizations])
                }
            }
        )();
    }, []);

    const organizationColumns = [
        {
            title: 'Id',
            key: 'id',
            render: (r: { id: string}) => (
                <a onClick={() => goToOrganizationDashboard(r.id)}>{r.id}</a>
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Members',
            key: 'members',
            render: (r: { members: Member[], id: string}) => (
                <a onClick={() => handleOrganizationMembersClick(r.id)}>{r.members.length}</a>
            )
        },
        {
            title: 'Owner',
            dataIndex: 'ownerId',
            key: 'owner',
        },
        {
            title: 'Action',
            key: 'id',
            render: (_: any, record: { id: any; }) => (
                <>
                <div style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <a onClick={() => goToSettings(record.id)}> Settings </a>
                    <a onClick={() => handleFeaturesClick(record.id)}> Features </a>
                    <a> Delete </a>

                </div>

                </>
            )
        },
    ];

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    return (
        <div className="center-wrapper">
            <Card title={"Manage Organizations"} bodyStyle={{overflowX: "auto"}}>
                {alertMessage !== null && alertMessage.message !== "" && (
                  <div style={{margin: "24px"}}>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                  </div>
                )}
                <Table dataSource={organizations} columns={organizationColumns} />
            </Card>
            <Modal
                title="Organization Features"
                visible={isFeatureModalVisible}
                onCancel={handleFeatureModalClose}
                onOk={handleFeatureModalClose}
            >
                <FeatureToggleList organizationId={selectedOrganizationId} visible={isFeatureModalVisible} />
            </Modal>
            <Modal 
                title="Organization Members"
                visible={isOrganizationMembersModalVisible}
                onCancel={handleOrganizationMembersModalClose}
                onOk={handleOrganizationMembersModalClose}
                width={1000}
            >
                <OrganizationMembersList organizationId={selectedOrganizationId!!} setAlertMessage={setAlertMessage} />
            </Modal>
      </div>
    );
}

export default Organizations;