import { Alert, Button, Card, Form, Input, Select, Table, Typography, Spin, Space, Modal} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";
import { Alert as AlertModel, AlertType } from "../../models/Alert";

interface Project {
    projectName: string,
    members: Member[],
}

interface Member {
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

  const saveSettings = async (values: {openAiApiKey: string, model: string, prompt: string}) => {
    setLoading(true)
    const { openAiApiKey, model, prompt } = values;
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
          prompt
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

            // create hook for user and figure out how to add to it
          }
        }
        )();
  }, [projectId]);

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

  function Loading() {
    if(loading) {
      return <Space size="middle"> <Spin size="large" className="spinner" /> </Space>
    }
  }

  const userData = project?.members.map((member, index) => (
    {
      key: index,
      email: member.email,
      role: member.role,
      personId: member.personId
    }
  ))

  const handleDeleteMember = async (personId: string) => {
    {
      if(projectId) {
        const jwt = localStorage.getItem('jwt');
        await fetch(`${import.meta.env.VITE_APP_API_URL}/api/project/${projectId}/person?personId=${personId}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });

        // remove from data source
      }
    }
  }

  const handleAddMember = async (email: string) => {
    {
      if(projectId) {
        const jwt = localStorage.getItem('jwt');
        // todo: change this to email in gateway
        await fetch(`${import.meta.env.VITE_APP_API_URL}/api/project/${projectId}/person?personId=${email}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
        });

        // return the full user in response and add to datasource
      }
    }
  }

  const userColumns = [
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

  return (
    <div className="center-wrapper">
      {alertMessage !== null && alertMessage.message !== "" && (
        <div>
          <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
        </div>
      )}
      <Typography.Title level={2}>Settings</Typography.Title>
      <Card title={project?.projectName + " settings"} bodyStyle={{padding: "0"}}>
        <Loading/>
        <Form
            form={form}
            onFinish={saveSettings}
            labelCol={{style: {minWidth: "130px"}}}
            labelAlign="left"
        >
          <div className="settings-form-fields">
            <Form.Item
              label="Open AI Api Key"
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              name={"openAiApiKey"}
              rules={[
                {
                  required: true,
                  message: "Please enter OpenAI Api Key",
                }
              ]}
            >
              <Input.Password placeholder="Enter OpenAI Api Key" />
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
          <div className="settings-form-buttons">
            <Button type="primary" disabled={loading} htmlType="submit">Save</Button>
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
          handleAddMember("email")
          setIsMemberModal(false)
        }}
        >
          <Input placeholder="Enter member email"/>
        </Modal>

      <Card title={project?.projectName + " members"} bodyStyle={{padding: "0"}} style={{marginTop: "24px"}}>
        <div className="settings-form-buttons" style={{borderTop: 0}}>
          <Button type="primary" onClick={() => setIsMemberModal(true)}>+ Add</Button>
        </div>
        <div className="settings-form-field-100">
          <Table style={{paddingLeft: "24px", paddingTop: "24px"}} dataSource={userData} columns={userColumns} />
        </div>
      </Card>
    </div>
  );
}

export default Settings;