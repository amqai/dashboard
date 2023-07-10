import { Alert, Button, Card, Divider, Form, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Project {
    projectName: string,
    members: Member[],
}

interface Member {
    email: string
}

function Settings() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  const [errorMessage, setErrorMessage] = useState('');

  const saveOpenAiApiKey = async () => { }
  const saveModel = async () => { }

  const dismissAlert = () => {
    setErrorMessage("");
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
          }
        }
        )();
  }, [projectId]);

  return (
    <div className="center-wrapper">
      {errorMessage !== "" && (
        <div className="erroralert">
          <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
        </div>
      )}
      <Typography.Title level={2}>Settings</Typography.Title>
      <Card title="OpenAI API Key" bodyStyle={{padding: "0"}}>
        <Form onFinish={saveOpenAiApiKey}>
          <div className="settings-form-fields">
            <Form.Item
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              name={"openaiapikey"}
              rules={[
                {
                  required: true,
                  message: "Please enter OpenAI Api Key",
                }
              ]}
            >
              <Input.Password placeholder="OpenAI API Key" />
            </Form.Item>
          </div>
          <div className="settings-form-buttons">
            <Button type="primary" htmlType="submit" style={{margin: "10px"}}>Save</Button>
          </div>
        </Form>
      </Card>

      <Card title="Model" bodyStyle={{padding: "0"}} style={{marginTop: "30px"}}>
        <Form onFinish={saveModel}>
          <div className="settings-form-fields">
            <Form.Item
              style={{paddingLeft: "24px", paddingTop: "24px"}}
              name={"model"}
              rules={[
                {
                  required: true,
                  message: "Please select model",
                }
              ]}
            >
              <Input placeholder="Model" />
            </Form.Item>
          </div>
          <div className="settings-form-buttons">
            <Button type="primary" htmlType="submit" style={{margin: "10px"}}>Save</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Settings;