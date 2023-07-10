import { Alert, Button, Card, Col, Divider, Form, Input, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { fetchProjects } from "../../Services/ApiService";
import { useNavigate } from "react-router-dom";

interface Project {
    projectName: string,
    projectDescription: string,
    projectId: string,
  }

function HomePage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState<Project[] | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        (
            async () => {
                const jwt = localStorage.getItem('jwt');
                const content = await fetchProjects(jwt!);
                if (content.status === 403) {
                    navigate("/login");
                } else if (content.data.errorCode) {
                    setErrorMessage(content.data.errorMessage)
                } else {
                    setMessage(content.data.projects);
                }
            }
        )();
    },[]);

    const dismissAlert = () => {
        setErrorMessage("");
    };

    return (
        <>
            <div className="contentwrapper">
                {errorMessage !== "" && (
                    <div className="erroralert">
                    <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
                    </div>
                )}
                <Button type="primary" onClick={() => setFormOpen(true)}>New Project</Button>
                {formOpen && (
                    <>
                        <Divider></Divider>
                        <Form>
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
                            <Button>Save</Button>
                            <Button style={{marginLeft: "10px"}} danger onClick={() => setFormOpen(false)}>Cancel</Button>
                        </Form>
                    </>
                )}
                <Divider></Divider>
                <Row gutter={[16, 16]}>
                    {message != null && message.map((project) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={project.projectId}>
                            <Card style={{height: "150px"}} title={project.projectName} extra={<a href={`/project/${project.projectId}/dashboard`}>Dashboard</a>}>
                                {project.projectDescription}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}

export default HomePage;