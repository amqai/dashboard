import { Alert, Button, Card, Col, Divider, Form, Input, Row, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import { fetchProjects } from "../../Services/ApiService";
import { useNavigate } from "react-router-dom";
import { Alert as AlertModel, AlertType } from "../../models/Alert";

interface Project {
    projectName: string,
    projectDescription: string,
    projectId: string,
  }

function HomePage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);

    const loadProjects = async () => {
        const jwt = localStorage.getItem('jwt');
        const content = await fetchProjects(jwt!);
        if (content.status === 403) {
            navigate("/login");
        } else if (content.data.errorCode) {
            setAlertMessage({
                message: 'There was an error loading your projects',
                type: AlertType.Error,
              })
        } else {
            setProjects(content.data.projects);
        }
    }

    useEffect(() => {
        (
            async () => {
                loadProjects();
            }
        )();
    },[]);

    const submit = async (
        values: { projectName: string; projectDescription: string; openAiApiKey: string; model: string; prompt: string }
        ) => {
        const { projectName, projectDescription, openAiApiKey, model, prompt} = values;
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                name: projectName,
                description: projectDescription,
                openAiApiKey,
                model,
                systemPrompt: prompt
            })
        });
  
        if (response.ok) {
            setAlertMessage({
              message: 'Your project was created successfully',
              type: AlertType.Success,
            })
            setFormOpen(false)
            loadProjects()
          } else {
            setAlertMessage({
              message: 'There was an error creating your project',
              type: AlertType.Error,
            })
          }
      }

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    const handleGoToDashboard = (project: Project) => navigate(`/project/${project.projectId}/dashboard`)

    return (
        <>
            <div className="center-wrapper">
                {alertMessage !== null && alertMessage.message !== "" && (
                    <div>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                    <Divider />
                    </div>
                )}
                <Button type="primary" onClick={() => setFormOpen(true)}>New Project</Button>
                {formOpen && (
                    <>
                        <Divider></Divider>
                        <Form onFinish={submit}>
                            <Typography.Title level={3}>Create new project</Typography.Title>
                            <Form.Item
                            name={"projectName"}
                            rules={[
                                {
                                required: true,
                                message: "Please enter project name",
                                }
                            ]}
                            >
                                <Input placeholder="Project Name" />
                            </Form.Item>
                            <Form.Item
                            name={"projectDescription"}
                            rules={[
                                {
                                required: true,
                                message: "Please enter project description",
                                }
                            ]}
                            >
                                <Input.TextArea rows={5} placeholder="Project Description" />
                            </Form.Item>
                            <Form.Item
                            name={"openAiApiKey"}
                            rules={[
                                {
                                required: true,
                                message: "Please enter OpenAI API Key",
                                }
                            ]}
                            >
                                <Input.Password placeholder="OpenAI Api Key" />
                            </Form.Item>
                            <Form.Item
                            name={"model"}
                            rules={[
                                {
                                required: true,
                                message: "Please enter project description",
                                }
                            ]}
                            >
                                 <Select placeholder="Select Model">
                                    <Select.Option value="gpt-3.5-turbo">GPT 3.5</Select.Option>
                                    <Select.Option value="gpt-4">GPT 4</Select.Option>
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
                            <Button type="primary" htmlType="submit">Save</Button>
                            <Button style={{marginLeft: "10px"}} danger onClick={() => setFormOpen(false)}>Cancel</Button>
                        </Form>
                    </>
                )}
                <Divider></Divider>
                <Row gutter={[16, 16]}>
                    {projects != null && projects.map((project) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={project.projectId} >
                            <Card className="projectCard" style={{height: "150px"}} title={project.projectName} onClick={() => handleGoToDashboard(project)}>
                                {project.projectDescription}
                                {/* <Button type="default"  href={`/project/${project.projectId}/dashboard`}> go to Dashboard </Button> */}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}

export default HomePage;