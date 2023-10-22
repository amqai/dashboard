import { Alert, Button, Card, Form, Input, Select, Spin, Space, Modal, Checkbox, Slider, Tabs} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/common.css";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { OrganizationApiDto } from "../../models/Organization";
import { hasPermission } from "../../Services/PermissionService";
import OrganizationMembersList from "../../Components/OrganizationMembersList";
import TabPane from "antd/es/tabs/TabPane";
import QuestionOverrideForm from "../../Components/QuestionOverrideForm";
import WordpressIntegrationForm from "../../Components/WordpressIntegrationForm";

function Settings() {
  const [form] = Form.useForm();
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(null);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [defaultApiKey, setDefaultApiKey] = useState(false);
  const [defaultApiKeyWarning, setDefaultApiKeyWarningModal] = useState(false);
  const [activeKey, setActiveKey] = useState(localStorage.getItem('organization.settings_page.activeTabKey') || "1");


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
          await loadSettings();
        }
      }
    )();
  }, [organizationId]);

  const loadSettings = async () => {
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
  };

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
      <Loading/>
      {alertMessage !== null && alertMessage.message !== "" && (
        <div style={{margin: "24px"}}>
          <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
        </div>
      )}
      <Tabs
          defaultActiveKey="1"
          activeKey={activeKey}
          onChange={(newActiveKey) => {
            setActiveKey(newActiveKey);
            localStorage.setItem('organization.settings_page.activeTabKey', newActiveKey);
            if (newActiveKey === '1') {
              loadSettings();
            }
          }}
        >
          
        <TabPane tab="Settings" key="1">
          <Card title={organization?.name + " settings"} bodyStyle={{padding: "0"}}>
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
        </TabPane>
        <TabPane tab="Members" key="2">
          <OrganizationMembersList organizationId={organizationId} setAlertMessage={setAlertMessage} />
        </TabPane>
        <TabPane tab="Overrides" key="3">
          <QuestionOverrideForm organizationId={organizationId} setAlertMessage={setAlertMessage} />
        </TabPane>
        <TabPane tab="WordPress Integration" key="4">
          <WordpressIntegrationForm organizationId={organizationId} setAlertMessage={setAlertMessage} />
        </TabPane>
      </Tabs>

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
    </div>
  );
}

export default Settings;