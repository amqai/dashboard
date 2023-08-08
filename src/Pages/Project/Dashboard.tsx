import { Alert, Button, Card, Col, Divider, Form, Input, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { fetchProjects } from "../../Services/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { Alert as AlertModel, AlertType } from "../../models/Alert";

interface Project {
    projectName: string,
    projectDescription: string,
    projectId: string,
  }

function HomePage() {
    const navigate = useNavigate();
    const { organizationId } = useParams();
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);

    const loadProjects = async (organizationId: string) => {
        const jwt = localStorage.getItem('jwt');
        const content = await fetchProjects(jwt!, organizationId);
        if (content.status === 403) {
            navigate("/login");
        } else if (content.data.errorCode) {
            setAlertMessage({
                message: 'There was an error loading your topics',
                type: AlertType.Error,
              })
        } else {
            setProjects(content.data.projects);
        }
    }

    useEffect(() => {
        (
            async () => {
                loadProjects(organizationId!!);
            }
        )();
    }, [organizationId]);

    const submit = async (values: { projectName: string; projectDescription: string; }) => {
      const { projectName, projectDescription} = values;
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects?organizationId=${organizationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
              name: projectName,
              description: projectDescription,
          })
      });

      if (response.ok) {
        setAlertMessage({
          message: 'Your topic was created successfully',
          type: AlertType.Success,
        })
        setFormOpen(false)
        loadProjects(organizationId!!)
      } else {
        setAlertMessage({
          message: 'There was an error creating your topic',
          type: AlertType.Error,
        })
      }
    }

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    const handleGoToDashboard = (project: Project) => navigate(`/organization/${organizationId}/topics/${project.projectId}/data`);

    return (
        <>
            <div className="center-wrapper">
                {alertMessage !== null && alertMessage.message !== "" && (
                    <div>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                    <Divider />
                    </div>
                )}
                <Button type="primary" onClick={() => setFormOpen(true)}>New Topic</Button>
                {formOpen && (
                    <>
                        <Divider></Divider>
                        <Form onFinish={submit}>
                            <Typography.Title level={3}>Create new topic</Typography.Title>
                            <Form.Item
                            name={"projectName"}
                            rules={[
                                {
                                required: true,
                                message: "Please enter topic name",
                                max: 50,
                                }
                            ]}
                            >
                                <Input placeholder="Topic Name" />
                            </Form.Item>
                            <Form.Item
                            name={"projectDescription"}
                            rules={[
                                {
                                required: true,
                                message: "Please enter topic description",
                                max: 255,
                                }
                            ]}
                            >
                                <Input.TextArea rows={5} placeholder="Topic Description" />
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
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </>
    );
}

export default HomePage;