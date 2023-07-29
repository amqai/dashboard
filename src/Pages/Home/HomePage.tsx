import { Alert, Button, Card, Checkbox, Col, Divider, Form, Input, Modal, Row, Select, Slider, Typography } from "antd";
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
    const [form] = Form.useForm();

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
        values: { name: string; projectDescription: string; openAiApiKey: string; model: string; prompt: string, temperature: number, searchSize: number, defaultKey: boolean, searchThreshold: number }
        ) => {
        const { name, openAiApiKey, model, prompt, temperature, searchSize, defaultKey, searchThreshold } = values;
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
                    searchThreshold,
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

    const openForm = () => {
        setFormOpen(true);
        form.setFieldsValue({
            openAiApiKey: "",
            defaultKey: true,
            model: "gpt-3.5-turbo",
            prompt: `You are a professional customer service agent whos purpose is to help and provide information based on the
context given. You will obey the following rules to the best of your ability.
1) Please answer the question at the very bottom only using the following context with as much relevant
information as you have available in the context provided.
2) If you are unable to answer because the context needed is missing, respond only with "Unable to determine output". 
3) Format your response to be as human friendly as possible.
4) Please provide any hyperlinks that you have available that are relevant to my question or to the answer you are providing. 
5) Please keep your response short and as concise as possible with no more than a few sentences.`,
            temperature: 50,
            searchSize: 5,
            searchThreshold: 80,
        });
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
                <Button type="primary" onClick={() => openForm()}>New Organization</Button>
                {formOpen && (
                    <>
                        <Divider></Divider>
                        <Form 
                            onFinish={submit}
                            form={form}
                            labelCol={{style: {minWidth: "150px"}}}
                            labelAlign="left"
                        >
                            <Typography.Title level={3}>Create new organization</Typography.Title>
                            <div className="settings-form-fields">
                                <Form.Item
                                name={"name"}
                                label="Name"
                                rules={[
                                    {
                                    required: true,
                                    message: "Please enter organization name",
                                    }
                                ]}
                                >
                                    <Input placeholder="Project Name" />
                                </Form.Item>
                            </div>
                            <div className="settings-form-fields">
                                <Form.Item
                                name={"openAiApiKey"}
                                label="OpenAI API Key"
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
                            </div>
                            <div className="settings-form-fields">
                                <Form.Item
                                name={"model"}
                                label="Default Model"
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
                            <div className="settings-form-fields-100">
                                <Form.Item
                                name={"prompt"}
                                label="System Prompt"
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
                            <div className="settings-form-fields-100">
                                <Form.Item
                                name={"searchSize"}
                                label="Max Search Results"
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
                            <div className="settings-form-fields-100">
                                <Form.Item
                                    label="Search Threshold %"
                                    name={"searchThreshold"}
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
                            <div className="settings-form-fields-100">
                                <Form.Item
                                    label="Creativity"
                                    name={"temperature"}
                                    rules={[
                                        {
                                        required: true,
                                        message: "Please input a creativity percentage",
                                        }
                                    ]}
                                    >
                                        <Slider
                                            min={1}
                                            max={200}
                                        />
                                </Form.Item>
                            </div>
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