import { Alert, Button, Card, Checkbox, Col, Divider, Form, Input, Modal, Row, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import { fetchOrganizations } from "../../Services/ApiService";
import { useNavigate } from "react-router-dom";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { OrganizationApiDto } from "../../models/Organization";

function HomePage() {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<OrganizationApiDto[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
    const [defaultApiKey, setDefaultApiKey] = useState(false);
    const [defaultApiKeyWarning, setDefaultApiKeyWarningModal] = useState(false);

    const loadOrganizations = async () => {
        const jwt = localStorage.getItem('jwt');
        const content = await fetchOrganizations(jwt!);
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

    useEffect(() => {
        (
            async () => {
                setDefaultApiKey(true);
                loadOrganizations();
            }
        )();
    },[]);

    const submit = async (
        values: { name: string; projectDescription: string; openAiApiKey: string; model: string; prompt: string, temperature: number, searchSize: number, defaultKey: boolean }
        ) => {
        const { name, openAiApiKey, model, prompt, temperature, searchSize, defaultKey } = values;
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                name,
                settings: {
                    openAiApiKey: openAiApiKey === undefined ? "" : openAiApiKey,
                    defaultKey,
                    model,
                    prompt,
                    temperature,
                    searchSize,
                }
            })
        });
  
        if (response.ok) {
            setAlertMessage({
              message: 'Your organization was created successfully',
              type: AlertType.Success,
            })
            setFormOpen(false)
            loadOrganizations()
          } else {
            setAlertMessage({
              message: 'There was an error creating your organization',
              type: AlertType.Error,
            })
          }
      }

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    const handleDefaultKeyChange = () => {
        setDefaultApiKey(!defaultApiKey)
    
        if(!defaultApiKey) {
          setDefaultApiKeyWarningModal(true)
        }
    }

    const handleGoToDashboard = (organization: OrganizationApiDto) => window.location.href = `/organization/${organization.id}/chat`

    return (
        <>
            <div className="center-wrapper">
                {alertMessage !== null && alertMessage.message !== "" && (
                    <div>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                    <Divider />
                    </div>
                )}
                <Button type="primary" onClick={() => setFormOpen(true)}>New Organization</Button>
                {formOpen && (
                    <>
                        <Divider></Divider>
                        <Form onFinish={submit}>
                            <Typography.Title level={3}>Create new organization</Typography.Title>
                            <Form.Item
                            name={"name"}
                            rules={[
                                {
                                required: true,
                                message: "Please enter organization name",
                                }
                            ]}
                            >
                                <Input placeholder="Project Name" />
                            </Form.Item>
                            <Form.Item
                            name={"openAiApiKey"}
                            rules={[
                                {
                                message: "Please enter OpenAI API Key",
                                }
                            ]}
                            >
                                <Input.Password disabled={defaultApiKey} placeholder="OpenAI Api Key" />
                            </Form.Item>
                            <Form.Item
                            name="defaultKey"
                            valuePropName="checked"
                            initialValue={true}
                            style={{paddingLeft: "24px"}}
                            >
                            <Checkbox style={{marginTop: "10px"}} onChange={handleDefaultKeyChange}>Check to use default openAI Api key</Checkbox>
                            </Form.Item>
                            <Form.Item
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
                            <Form.Item
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
                            <Form.Item
                            name={"temperature"}
                            rules={[
                                {
                                required: true,
                                message: "Please input a temperature setting",
                                }
                            ]}
                            >
                                <Input placeholder="Please input temperature setting 0-200" />
                            </Form.Item>
                            <Form.Item
                            name={"searchSize"}
                            rules={[
                                {
                                required: true,
                                message: "Please input maximum search relevancy results",
                                }
                            ]}
                            >
                                <Input placeholder="Please input maximum search relevancy results" />
                            </Form.Item>
                            <Button type="primary" htmlType="submit">Save</Button>
                            <Button style={{marginLeft: "10px"}} danger onClick={() => setFormOpen(false)}>Cancel</Button>
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
                        </Form>
                    </>
                )}
                <Divider></Divider>
                <Row gutter={[16, 16]}>
                    {organizations != null && organizations.map((organization) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={organization.id} >
                            <Card className="projectCard" style={{height: "150px"}} title={organization.name} onClick={() => handleGoToDashboard(organization)} hoverable>
                                Total Members: {organization.members.length}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}

export default HomePage;