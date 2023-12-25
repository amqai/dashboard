import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { fetchTopics } from "../../Services/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { hasPermission } from "../../Services/PermissionService";
import { IoAddSharp } from "react-icons/io5";
import { DeleteOutlined } from "@ant-design/icons";
import { Topic } from "../../models/Topic";
import { Member, OrganizationApiDto } from "../../models/Organization";

function HomePage() {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(
    null
  );
  const [organizationVisibility, setOrganizationVisibility] = useState<
    "PUBLIC" | "SELECTED_MEMBERS"
  >("PUBLIC");
  const [form] = Form.useForm();

  const loadTopics = async (organizationId: string) => {
    const jwt = localStorage.getItem("jwt");
    const content = await fetchTopics(jwt!, organizationId);
    if (content.status === 403) {
      navigate("/login");
    } else if (content.data.errorCode) {
      setAlertMessage({
        message: "There was an error loading your topics",
        type: AlertType.Error,
      });
    } else {
      setTopics(content.data.topics);
    }
  };

  useEffect(() => {
    (async () => {
      if (organizationId) {
        loadTopics(organizationId);
        loadOrganization(organizationId);
      }
    })();
  }, [organizationId]);

  // Get organization
  const loadOrganization = async (organizationId: string) => {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/organization?organizationId=${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();
    setOrganization(content);
    form.setFieldsValue({
      personIds: content.members.map((member: Member) => member.personId),
    })
  };

  const submit = async (values: {
    topicName: string;
    topicDescription: string;
    personIds: string[];
  }) => {
    const { topicName, topicDescription, personIds } = values;
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/topics?organizationId=${organizationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          name: topicName,
          description: topicDescription,
          topicOrganizationVisibility: organizationVisibility,
          personIds,
        }),
      }
    );

    if (response.ok) {
      setAlertMessage({
        message: "Your topic was created successfully",
        type: AlertType.Success,
      });
      setFormOpen(false);
      loadTopics(organizationId!!);
    } else {
      const content = await response.json();
      setAlertMessage({
        message: content.errorMessage,
        type: AlertType.Error,
      });
    }
  };

  const changeOrganizationVisibility = async () => {
    const newVisibility =
      organizationVisibility === "PUBLIC" ? "SELECTED_MEMBERS" : "PUBLIC";
    setOrganizationVisibility(newVisibility);
  };

  const showDeleteConfirm = (projectId: string, projectName: string) => {
    Modal.confirm({
      title: `Are you sure you want to delete the topic "${projectName}"?`,
      content: "This action cannot be undone.",
      okText: "Yes, delete it",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteTopic(projectId);
      },
    });
  };

  const deleteTopic = async (topicId: string) => {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/topics?topicId=${topicId}&organizationId=${organizationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (response.ok) {
      setAlertMessage({
        message: "Your topic was deleted successfully",
        type: AlertType.Success,
      });
      setFormOpen(false);
      loadTopics(organizationId!!);
    } else {
      setAlertMessage({
        message: "There was an error deleted your topic",
        type: AlertType.Error,
      });
    }
  };

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  const handleGoToDashboard = (topic: Topic) =>
    navigate(`/organization/${organizationId}/topics/${topic.topicId}/data`);

  const CardTitle = ({
    topicName,
    topicId,
  }: {
    topicName: string;
    topicId: string;
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{topicName}</span>
      {hasPermission("CREATE_TOPICS") && (
        <DeleteOutlined
          onClick={(e) => {
            e.stopPropagation(); // Prevent onClick of Card
            showDeleteConfirm(topicId, topicName);
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
            <Typography.Text>
              Select an existing topic, or create a new one
            </Typography.Text>
          </div>

          {hasPermission("CREATE_TOPICS") && (
            <Button
              className="addButton"
              type="primary"
              shape="circle"
              icon={<IoAddSharp />}
              onClick={() => setFormOpen(true)}
            ></Button>
          )}
        </div>

        {alertMessage !== null && alertMessage.message !== "" && (
          <div>
            <Alert
              message={alertMessage.message}
              onClose={dismissAlert}
              type={alertMessage.type}
              closable={true}
            />
          </div>
        )}
        <Divider></Divider>
        <Row gutter={[16, 16]}>
          {topics != null &&
            topics.map((topic: Topic) => (
              <Col xs={24} sm={12} md={8} lg={6} key={topic.topicId}>
                <Card
                  className="projectCard"
                  style={{ height: "150px" }}
                  title={
                    <CardTitle
                      topicName={topic.topicName}
                      topicId={topic.topicId}
                    />
                  }
                  onClick={() => handleGoToDashboard(topic)}
                >
                  {topic.topicDescription}
                </Card>
              </Col>
            ))}
        </Row>
      </div>
      <Drawer open={formOpen} size="large" onClose={() => setFormOpen(false)}>
          <Form onFinish={submit} form={form}>
            <Typography.Title level={3}>Create new topic</Typography.Title>
            <Form.Item
              name={"topicName"}
              rules={[
                {
                  required: true,
                  max: 50,
                },
              ]}
            >
              <Input placeholder="Topic Name" />
            </Form.Item>
            <Form.Item
              name={"topicDescription"}
              rules={[
                {
                  required: true,
                  max: 255,
                },
              ]}
            >
              <Input.TextArea rows={5} placeholder="Topic Description" />
            </Form.Item>
            <Form.Item
              name={"topicOrganizationVisibility"}
            >
              <strong>ALL MEMBERS </strong>
              <Switch
                checked={organizationVisibility === "SELECTED_MEMBERS"}
                onChange={changeOrganizationVisibility}
              />
              <strong> SPECIFIC MEMBERS</strong>
            </Form.Item>
            <Form.Item
              name={"personIds"}
              style={organizationVisibility === "PUBLIC" ? { display: "none" } : {}}
            >
              <Select
                mode="multiple"
                placeholder="Select Members"
                optionLabelProp="label"
              >
                {organization &&
                  organization.members.map((member: Member) => (
                    <Select.Option
                      value={member.personId}
                      label={member.email}
                      key={member.personId}
                    >
                      {member.email}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button
              style={{ marginLeft: "10px" }}
              danger
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
          </Form>
        </Drawer>
    </>
  );
}

export default HomePage;
