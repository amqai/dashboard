import { Alert, Button, Card, Form, Input, Select, Table, Typography, Spin, Space, Modal, Checkbox, Slider} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/common.css";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { OrganizationApiDto } from "../../models/Organization";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { hasPermission } from "../../Services/PermissionService";

interface Member {
    key: string
    email: string
    personId: string
    permissions: string
}

function Settings() {
  const [form] = Form.useForm();
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(null);
  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMemberModal, setIsMemberModal] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberPersonId, setMemberPersonId] = useState("")
  const [memberData, setMemberData] = useState<Member[]>()
  const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
  const [defaultApiKey, setDefaultApiKey] = useState(false)
  const [defaultApiKeyWarning, setDefaultApiKeyWarningModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingMember, setCurrentEditingMember] = useState<Member | null>(null);


  const saveSettings = async (values: { openAiApiKey: any; model: any; prompt: any; defaultKey: any; temperature: any, searchSize: any, searchThreshold: any }) => {
    setLoading(true)
    const { openAiApiKey, model, prompt, defaultKey, temperature, searchSize, searchThreshold } = values;
    if(organizationId) {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/settings?organizationId=${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          openAiApiKey,
          model,
          prompt,
          defaultKey,
          temperature,
          searchSize,
          searchThreshold,
        })
      });
      
      if (response.ok) {
        setAlertMessage({
          message: 'Your organization settings were successfully updated',
          type: AlertType.Success,
        })
      } else {
        setAlertMessage({
          message: 'There was an error updating your organization settings',
          type: AlertType.Error,
        })
      }
      setLoading(false)
    }
  }

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  useEffect(() => {
    (async () => {
      if (organizationId) {
        if (!hasPermission("MANAGE_ORGANIZATION")) {
          navigate("/");
        }
      }
    })();
  }, [location, organizationId]);

  // Get organization
  useEffect(() => {
    (
      async () => {
        if (organizationId) {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization?organizationId=${organizationId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const content = await response.json();
          setOrganization(content)
        }
      }
      )();
  }, [organizationId]);

  // Get settings
  useEffect(() => {
    (
      async () => {
        if(organizationId) {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/settings?organizationId=${organizationId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const settings = await response.json()
          form.setFieldsValue({
            openAiApiKey: settings?.openAiApiKey,
            defaultKey: settings?.openAiApiKey === "" ? true : false,
            model: settings?.model,
            prompt: settings?.prompt,
            temperature: settings?.temperature,
            searchSize: settings?.searchSize,
            searchThreshold: settings?.searchThreshold,
          });
          setDefaultApiKey(settings?.openAiApiKey === "" ? true : false);
          handleMemberTableUpdate(settings);
          setMemberPermissions(["READ", "MANAGE_DATA", "CREATE_TOPICS", "UPLOAD_DATA", "MANAGE_ORGANIZATION"])
        }
      }
    )();
  }, [organizationId])

  // Delete member
  const handleDeleteMember = async (personId: string) => {
    {
      if(organizationId) {
        if(memberData?.length == 1){
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
  }

  const handleCheckboxChange = (checkedValues: CheckboxValueType[]) => {
    setMemberPermissions(checkedValues as string[]);
  };

  // Add member
  const handleAddMember = async () => {
    if(organizationId) {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/members?organizationId=${organizationId}&email=${memberEmail}`, {
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
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/settings?organizationId=${organizationId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        const settings = await res.json()
        handleMemberTableUpdate(settings);
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
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/settings?organizationId=${organizationId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        const settings = await res.json()
        handleMemberTableUpdate(settings);
      }
    }
  };

  const handleMemberTableUpdate = async(settings: any) => {
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
  }

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

  function Loading() {
    if(loading) {
      return <Space size="middle"> <Spin size="large" className="spinner" /> </Space>
    }
  }

  function handleDefaultKeyChange() {
    setDefaultApiKey(!defaultApiKey)

    if(!defaultApiKey) {
      setDefaultApiKeyWarningModal(true)
    }
  }

  return (
    <div className="center-wrapper">
      <Typography.Title level={2}>Settings</Typography.Title>
      <Card title={organization?.name + " settings"} bodyStyle={{padding: "0"}}>
      {alertMessage !== null && alertMessage.message !== "" && (
        <div style={{margin: "24px"}}>
          <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
        </div>
      )}
        <Loading/>
        <Form
            form={form}
            onFinish={saveSettings}
            labelCol={{style: {minWidth: "150px"}}}
            labelAlign="left"
        >
          <div className="settings-form-fields">
          <Form.Item
              label="Open AI Api Key"
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              name={"openAiApiKey"}
              rules={[
              {
                  required: !defaultApiKey,
                  message: "Please enter OpenAI Api Key",
              }
              ]}
          >
              <Input.Password disabled={defaultApiKey} placeholder="Enter OpenAI Api Key" />
          </Form.Item>
          </div>

          <div className="settings-form-fields">
          <Form.Item
              name="defaultKey"
              valuePropName="checked"
              style={{paddingLeft: "24px"}}
          >
              <Checkbox style={{marginTop: "10px"}} onChange={handleDefaultKeyChange}>Check to use default openAI Api key</Checkbox>
          </Form.Item>
          </div>

          <div className="settings-form-fields">
          <Form.Item
              label="Model"
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              name={"model"}
              rules={[
              {
                  required: true,
                  message: "Please select model",
              }
              ]}
          >
              <Select placeholder="Select Model">
              <Select.Option value="gpt-3.5-turbo">GPT 3.5</Select.Option>
              <Select.Option value="gpt-3.5-turbo-16k">GPT 3.5 Turbo 16k</Select.Option>
              <Select.Option value="gpt-4">GPT 4</Select.Option>
              <Select.Option value="gpt-4-32k">GPT 4 32k</Select.Option>
              </Select>
          </Form.Item>
          </div>

          <div className="settings-form-field-100">
          <Form.Item
              label="Base Prompt"
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              name={"prompt"}
              rules={[
              {
                  required: true,
                  message: "Please input system prompt",
              }
              ]}
          >
              <Input.TextArea rows={8} placeholder="You are a friendly customer service agent who's job is to..." />
          </Form.Item>
          </div>
          <div className="settings-form-field-100">
          <Form.Item
              label="Max Search Size"
              name={"searchSize"}
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              rules={[
                  {
                  required: true,
                  message: "Please input maximum search relevancy results",
                  }
              ]}
              >
                  <Slider
                      min={1}
                      max={20}
                  />
          </Form.Item>
          </div>
          <div className="settings-form-field-100">
          <Form.Item
              label="Search Threshold %"
              name={"searchThreshold"}
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              rules={[
                  {
                  required: true,
                  message: "Please input minimum threshold percentage for search hits",
                  }
              ]}
              >
                <Slider
                  min={1}
                  max={100}
                />
          </Form.Item>
          </div>
          <div className="settings-form-field-100">
          <Form.Item
              label="Creativity"
              name={"temperature"}
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              rules={[
                  {
                  required: true,
                  message: "Please input a temperature setting",
                  }
              ]}
              >
                <Slider
                  min={1}
                  max={200}
                />
          </Form.Item>
          </div>
          <div className="settings-form-buttons">
          <Button type="primary" disabled={loading} htmlType="submit">Save</Button>
          </div>
        </Form>
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
        </Checkbox.Group>
      </Modal>

      <Modal
        open={defaultApiKeyWarning}
        title="Warning"
        okText="Ok"
        onOk={() => {
          setDefaultApiKeyWarningModal(false)
          setDefaultApiKey(true)
        }}
      >
        <p>Selecting this option will overwrite the Open AI Api Key with the default AMQAI key.</p>
      </Modal>

      <Card title={organization?.name + " members"} bodyStyle={{padding: "0"}} style={{marginTop: "24px"}}>
        <div className="settings-form-buttons" style={{borderTop: 0}}>
          <Button type="primary" onClick={() => setIsMemberModal(true)}>+ Add</Button>
        </div>
        <div className="settings-form-field-100">
          <Table style={{paddingLeft: "24px", paddingTop: "24px"}} dataSource={memberData} columns={memberColumns} />
        </div>
      </Card>
    </div>
  );
}

export default Settings;