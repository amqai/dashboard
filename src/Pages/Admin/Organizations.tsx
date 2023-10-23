import { useEffect, useState } from "react";
import { Table, Card, Button, Alert, Modal } from "antd";
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
                <a href={`/organization/${r.id}/`}>{r.id}</a>
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
                    <a 
                        onClick={() => goToSettings(record.id)}
                    >Settings</a>
                    <Button
                        style={{marginLeft:"1rem"}}
                        onClick={() => handleFeaturesClick(record.id)}
                    >Features</Button>
                    <Button
                        disabled
                        style={{marginLeft:"1rem"}}
                    >Delete</Button>
                </>
            )
        },
    ];

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    return (
        <div>
            <Card title={"Manage Organizations"} bodyStyle={{padding: "0"}} style={{margin: "5%"}}>
                {alertMessage !== null && alertMessage.message !== "" && (
                  <div style={{margin: "24px"}}>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                  </div>
                )}
                <div className="settings-form-field-100">
                <Table style={{paddingLeft: "24px", paddingTop: "24px"}} dataSource={organizations} columns={organizationColumns} />
                </div>
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