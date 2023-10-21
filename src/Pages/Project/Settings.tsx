import { Alert, Button, Card, Form, Input, Select, Table, Typography, Spin, Space, Modal, Checkbox} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";
import { Alert as AlertModel, AlertType } from "../../models/Alert";

interface Project {
    projectName: string,
    members: Member[],
}

interface Member {
    key: string
    email: string
    role: string
    personId: string
}

function Settings() {
  const [form] = Form.useForm();
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMemberModal, setIsMemberModal] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberData, setMemberData] = useState<Member[]>()
  const [defaultApiKey, setDefaultApiKey] = useState(false)
  const [defaultApiKeyWarning, setDefaultApiKeyWarningModal] = useState(false)

  const saveSettings = async (values: { openAiApiKey: any; model: any; prompt: any; defaultKey: any; }) => {
    setLoading(true)
    const { openAiApiKey, model, prompt, defaultKey } = values;
    if(projectId) {
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          openAiApiKey,
          model,
          prompt,
          defaultKey
        })
      });
      
      if (response.ok) {
        setAlertMessage({
          message: 'Your project settings were successfully updated',
          type: AlertType.Success,
        })
      } else {
        setAlertMessage({
          message: 'There was an error updating your project settings',
          type: AlertType.Error,
        })
      }
      setLoading(false)
    }
  }

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  // Get project
  useEffect(() => {
    (
      async () => {
        if (projectId) {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const content = await response.json();
          setProject(content)

          const userData = content?.members.map((member: { personId: any; email: any; role: any; }) => (
            {
              key: member.personId,
              email: member.email,
              role: member.role,
              personId: member.personId
            }
          ))
          if(userData != null) {
            setMemberData(...[userData])
          }
        }
      }
      )();
  }, [projectId]);

  // Get settings
  useEffect(() => {
    (
      async () => {
        if(projectId) {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/settings`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const settings = await response.json()
          form.setFieldsValue({
            openAiApiKey: settings?.openAiApiKey,
            model: settings?.model,
            prompt: settings?.prompt
          });
        }
      }
    )();
  }, [projectId])

  // Delete member
  const handleDeleteMember = async (personId: string) => {
    {
      if(projectId) {
        if(memberData?.length == 1){
          setAlertMessage({
            message: 'There must be at least one member in the project',
            type: AlertType.Error,
          })
        } else {
          const jwt = localStorage.getItem('jwt');
          await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/person?personId=${personId}`, {
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

  // Add member
  const handleAddMember = async () => {
    {
      if(projectId) {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/person?email=${memberEmail}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });

        setMemberEmail("")
        const content = await response.json();
        if(content) {
          const member = [{
            key: content?.personId,
            email: content?.email,
            role: content?.role,
            personId: content?.personId
          }]

          setMemberData(memberData ? [...memberData, ...member] : [...member]);
        }
      }
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
      title: 'Roles',
      dataIndex: 'role',
      key: 'role',
      personId: 'id',
    },
    {
      title: 'Action',
      key: 'id',
      personId: 'id',
      render: (_: any, record: { personId: any; }) => (
        <Button onClick={() => handleDeleteMember(record.personId)}>
          Delete
        </Button>
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
      <Card title={project?.projectName + " settings"}>
      {alertMessage !== null && alertMessage.message !== "" && (
        <div >
          <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
        </div>
      )}
        <Loading/>
        <Form
            form={form}
            onFinish={saveSettings}
            labelCol={{style: {minWidth: "130px"}}}
            labelAlign="left"
        >
          <div className="settings-form" style={{padding: "5%"}}>

              <Form.Item
                label="Open AI Api Key"
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

              <Form.Item
                name="defaultKey"
                valuePropName="checked"
              >
                <Checkbox style={{marginTop: "10px"}} onChange={handleDefaultKeyChange}>Check to use default openAI Api key</Checkbox>
              </Form.Item>

              <Form.Item
                label="Model"
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
                </Select>
              </Form.Item>

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

            <div className="settings-form-buttons">
              <Button type="primary" disabled={loading} htmlType="submit">Save</Button>
            </div>
          </div>

        </Form>
      </Card>

      <Modal
        open={isMemberModal}
        title="Add Member"
        okText="Save"
        onCancel={() => {
          setIsMemberModal(false)
        }}
        onOk={() => {
          handleAddMember()
          setIsMemberModal(false)
        }}
      >
        <Input placeholder="Enter member email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)}/>
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

      <Card title={project?.projectName + " members"} bodyStyle={{padding: "0"}} style={{marginTop: "24px"}}>
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