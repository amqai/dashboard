import React, { useState, useEffect } from 'react';
import { Button, Card, Checkbox, Input, Modal, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { Alert as AlertModel, AlertType } from "../models/Alert";

interface OrganizationMembersListProps {
    organizationId: string | undefined;
    setAlertMessage: React.Dispatch<React.SetStateAction<AlertModel | null>>;
}

interface Member {
    key: string
    email: string
    personId: string
    permissions: string
}
  
const OrganizationMembersList: React.FC<OrganizationMembersListProps> = ({ organizationId, setAlertMessage }) => {
    const [memberData, setMemberData] = useState<Member[]>();
    const [isMemberModal, setIsMemberModal] = useState(false);
    const [memberPersonId, setMemberPersonId] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditingMember, setCurrentEditingMember] = useState<Member | null>(null);
    const [memberEmail, setMemberEmail] = useState("");
    const [memberPermissions, setMemberPermissions] = useState<string[]>([]);

    const handleCheckboxChange = (checkedValues: CheckboxValueType[]) => {
        setMemberPermissions(checkedValues as string[]);
    };

    const handleMemberTableUpdate = async() => {
        const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/settings?organizationId=${organizationId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

        const settings = await response.json()
        const userData = settings?.members.map((member: { personId: any; email: any; permissions: any }) => (
          {
            key: member.personId,
            email: member.email,
            permissions: member.permissions.join(", "),
            personId: member.personId
          }
        ))
        if(userData != null) {
          setMemberData(...[userData])
        }
    };

    // Add member
    const handleAddMember = async () => {
        if(organizationId) {
            const jwt = localStorage.getItem('jwt');
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/members?organizationId=${organizationId}&email=${memberEmail}`, {
                method: "POST",
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ permissions: memberPermissions })
            });

            setMemberEmail("")
            const content = await response.json();
            if(content) {
                handleMemberTableUpdate();
            }
        }
    };

    // Delete member
    const handleDeleteMember = async (personId: string) => {
        {
        if(organizationId) {
            if(memberData?.length == 1) {
                console.log("TEST");
                setAlertMessage({
                    message: 'There must be at least one member in the project',
                    type: AlertType.Error,
                })
            } else {
                const jwt = localStorage.getItem('jwt');
                await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/members?organizationId=${organizationId}&personId=${personId}`, {
                    method: "DELETE",
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                    },
                })
                .then((response) => {
                    if(response.ok) {
                        setMemberData(memberData?.filter((member) => member.personId != personId))
                    }
                })
            }
        }
        }
    };

    const handleUpdateMember = async (personId: string) => {
        if (organizationId && currentEditingMember) {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/members?organizationId=${organizationId}&personId=${personId}`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ permissions: memberPermissions })
          });
    
          setMemberEmail("")
          const content = await response.json();
          if(content) {
            handleMemberTableUpdate();
          }
        }
    };

    const memberColumns = [
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          personId: 'id',
        },
        {
          title: 'Permissions',
          dataIndex: 'permissions',
          key: 'permissions',
          personId: 'id',
        },
        {
          title: 'Action',
          key: 'id',
          personId: 'id',
          render: (_: any, record: Member) => (
            <>
              <EditOutlined
                  onClick={() => {
                      setIsEditing(true);
                      setIsMemberModal(true);
                      setCurrentEditingMember(record);
                      setMemberEmail(record.email);
                      setMemberPermissions(record.permissions.split(", "));
                      setMemberPersonId(record.personId);
                  }}
              />
              <DeleteOutlined
                  onClick={() => {
                    handleDeleteMember(record.personId);
                  }}
                  style={{ color: "red", marginLeft: 12 }}
              />
            </>
          ),
        },
    ];

    useEffect(() => {
        (
          async () => {
            if(organizationId) {
                handleMemberTableUpdate();
                setMemberPermissions(["READ", "MANAGE_DATA", "CREATE_TOPICS", "UPLOAD_DATA", "MANAGE_ORGANIZATION", "MANAGE_INTEGRATIONS"])
            }
          }
        )();
    }, [organizationId])

    return (
        <>
            <Card title="Members" bodyStyle={{padding: "0"}} style={{marginTop: "24px"}}>
                <div className="settings-form-buttons" style={{borderTop: 0}}>
                <Button type="primary" onClick={() => setIsMemberModal(true)}>+ Add</Button>
                </div>
                <div className="settings-form-field-100">
                <Table style={{paddingLeft: "24px", paddingTop: "24px"}} dataSource={memberData} columns={memberColumns} />
                </div>
            </Card>
            <Modal
                open={isMemberModal}
                title={isEditing ? "Edit Member" : "Add Member"}
                okText="Save"
                onCancel={() => {
                    setIsMemberModal(false);
                    setIsEditing(false);
                    setCurrentEditingMember(null);
                    setMemberEmail("");
                    setMemberPermissions([]);
                    setMemberPersonId("");
                }}      
                onOk={() => {
                    if (isEditing) {
                        handleUpdateMember(memberPersonId);
                    } else {
                        handleAddMember();
                    }
                    setIsMemberModal(false);
                    setIsEditing(false);
                    setCurrentEditingMember(null);
                }}
            >
                <Input
                    placeholder="Enter member email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    disabled={isEditing}
                />
                <Checkbox.Group onChange={handleCheckboxChange} defaultValue={memberPermissions}>
                    <Checkbox value="READ" className="settings-checkbox">READ</Checkbox>
                    <Checkbox value="MANAGE_DATA" className="settings-checkbox">MANAGE_DATA</Checkbox>
                    <Checkbox value="CREATE_TOPICS" className="settings-checkbox">CREATE_TOPICS</Checkbox>
                    <Checkbox value="UPLOAD_DATA" className="settings-checkbox">UPLOAD_DATA</Checkbox>
                    <Checkbox value="MANAGE_ORGANIZATION" className="settings-checkbox">MANAGE_ORGANIZATION</Checkbox>
                    <Checkbox value="MANAGE_INTEGRATIONS" className="settings-checkbox">MANAGE_INTEGRATIONS</Checkbox>
                </Checkbox.Group>
            </Modal>
        </>
    );
};

export default OrganizationMembersList;
