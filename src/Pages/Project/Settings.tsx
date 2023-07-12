import { Alert, Button, Card, Form, Input, Select, Table, Typography, Spin, Space } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";

interface Project {
    projectName: string,
    members: Member[],
}

interface ProjectSettings {
    openAiApiKey: string,
    model: string,
    prompt: string
}

interface Member {
    email: string
}

function Settings() {
  const [form] = Form.useForm();
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [settings, setSettings] = useState<ProjectSettings | null> (null)

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const saveSettings = async (values: {openAiApiKey: string, model: string, prompt: string}) => {
    setLoading(true)
    const { openAiApiKey, model, prompt } = values;
    if(projectId) {
      const jwt = localStorage.getItem('jwt');
      await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/${projectId}/settings`, {
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
      
      
      setLoading(false)
      // check for errors here
      // const data = await response.json();
      // if (data.errorCode) {
      //     setErrorMessage(data.errorMessage)
      // }
    }
  }

  const dismissAlert = () => {
    setErrorMessage("");
  };

  const dataSourceProjectMembers = [
    {
      key: '1',
      email: 'vectorl33t2@gmail.com',
      roles: 'ADMIN,USER',
      action: 'Remove'
    },
    {
      key: '2',
      email: 'tepayne97@gmail.com',
      roles: 'ADMIN,USER',
      action: 'Remove'
    },
  ];
  
  const columnsProjectMembers = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
  ];

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
          setSettings(settings)
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

  return (
    <div className="center-wrapper">
      {errorMessage !== "" && (
        <div className="erroralert">
          <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
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
                <Select.Option value="gpt-4">GPT 4</Select.Option>
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

      <Card title={project?.projectName + " members"} bodyStyle={{padding: "0"}} style={{marginTop: "24px"}}>
        <div className="settings-form-buttons" style={{borderTop: 0}}>
          <Button type="primary">+ Add</Button>
        </div>
        <div className="settings-form-field-100">
          <Table style={{paddingLeft: "24px", paddingTop: "24px"}} dataSource={dataSourceProjectMembers} columns={columnsProjectMembers} />
        </div>
      </Card>
    </div>
  );
}

export default Settings;