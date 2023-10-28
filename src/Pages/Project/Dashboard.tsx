import { Alert, Button, Card, Col, Divider, Form, Input, Modal, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { fetchProjects } from "../../Services/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { hasPermission } from "../../Services/PermissionService";
import { IoAddSharp } from "react-icons/io5"
import { DeleteOutlined } from "@ant-design/icons";

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

    const showDeleteConfirm = (projectId: string, projectName: string) => {
        Modal.confirm({
            title: `Are you sure you want to delete the topic "${projectName}"?`,
            content: 'This action cannot be undone.',
            okText: 'Yes, delete it',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                deleteTopic(projectId);
            },
        });
    };

    const deleteTopic = async (topicId: string) => {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects?projectId=${topicId}&organizationId=${organizationId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
        });
  
        if (response.ok) {
          setAlertMessage({
            message: 'Your topic was deleted successfully',
            type: AlertType.Success,
          })
          setFormOpen(false)
          loadProjects(organizationId!!)
        } else {
          setAlertMessage({
            message: 'There was an error deleted your topic',
            type: AlertType.Error,
          })
        }
    }

    const dismissAlert = () => {
        setAlertMessage(null);
    };

    const handleGoToDashboard = (project: Project) => navigate(`/organization/${organizationId}/topics/${project.projectId}/data`);

    const CardTitle = ({ projectName, projectId }: { projectName: string, projectId: string }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{projectName}</span>
            {hasPermission("CREATE_TOPICS") && (
                <DeleteOutlined
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent onClick of Card
                        showDeleteConfirm(projectId, projectName);
                    }}
                    style={{ color: "red", cursor: "pointer" }}
                />
            )}
        </div>
    );

    return (
        <>
            <div className="center-wrapper">
                <div className="page-headers">
                    <div>
                        <Typography.Title level={2}>Topics</Typography.Title>
                        <Typography.Text>Select an existing topic, or create a new one</Typography.Text>
                    </div>

                    {hasPermission("CREATE_TOPICS") && (
                        <Button className="addButton" 
                        type="primary" 
                        shape="circle" 
                        icon={<IoAddSharp/>}
                        onClick={() => setFormOpen(true)}></Button>
                    )}
                </div>

                {alertMessage !== null && alertMessage.message !== "" && (
                    <div>
                    <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
                    </div>
                )}

                {formOpen && (
                    <>
                        <Divider></Divider>
                        <Form onFinish={submit}>
                            <Typography.Title level={3}>Create new topic</Typography.Title>
                            <Form.Item
                            name={"projectName"}
                            label="Topic name"
                            labelCol={{ style: { display: 'none' } }}
                            rules={[
                                {
                                required: true,
                                max: 50,
                                }
                            ]}
                            >
                                <Input placeholder="Topic Name" />
                            </Form.Item>
                            <Form.Item
                            name={"projectDescription"}
                            label="Topic Description"
                            labelCol={{ style: { display: 'none' } }}
                            rules={[
                                {
                                required: true,
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
                            <Card 
                                className="projectCard"
                                style={{height: "150px"}}
                                title={<CardTitle projectName={project.projectName} projectId={project.projectId} />}
                                onClick={() => handleGoToDashboard(project)}
                            >
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