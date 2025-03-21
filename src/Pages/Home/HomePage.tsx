import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Slider,
  Typography,
  Tooltip,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { fetchOrganizations } from "../../Services/ApiService";
import { useNavigate } from "react-router-dom";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { OrganizationApiDto } from "../../models/Organization";
import { CurrentPerson } from "../../models/Person";
import { IoIosAdd } from "react-icons/io";
import { BiSolidHelpCircle } from "react-icons/bi";

function HomePage() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<
    OrganizationApiDto[] | null
  >(null);
  const [formOpen, setFormOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [defaultApiKey, setDefaultApiKey] = useState(false);
  const [defaultApiKeyWarning, setDefaultApiKeyWarningModal] = useState(false);
  const [toggleSettings, setToggleSettings] = useState(false);
  const [form] = Form.useForm();
  const [currentPerson, setCurrentPerson] = useState<CurrentPerson | null>(
    null
  );

  const loadOrganizations = async () => {
    const jwt = localStorage.getItem("jwt");
    const content = await fetchOrganizations(jwt!, false);
    if (content.status === 403) {
      navigate("/login");
    } else if (content.data.errorCode) {
      setAlertMessage({
        message: "There was an error loading your organizations",
        type: AlertType.Error,
      });
    } else {
      setOrganizations(content.data.organizations);
    }
  };

  useEffect(() => {
    (async () => {
      setDefaultApiKey(true);
      loadOrganizations();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const jwt = localStorage.getItem("jwt");
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/person/status`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const content = await response.json();
      setCurrentPerson(content);
    })();
  }, [organizations]);

  const submit = async (values: {
    name: string;
    billingEmail: string;
    projectDescription: string;
    openAiApiKey: string;
    model: string;
    prompt: string;
    temperature: number;
    searchSize: number;
    defaultKey: boolean;
    searchThreshold: number;
    responseSpeedMs: number;
  }) => {
    const {
      name,
      billingEmail,
      openAiApiKey,
      model,
      prompt,
      temperature,
      searchSize,
      defaultKey,
      searchThreshold,
      responseSpeedMs,
    } = values;
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/organization`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          name,
          billingEmail,
          settings: {
            name,
            openAiApiKey: openAiApiKey === undefined ? "" : openAiApiKey,
            defaultKey,
            model,
            prompt,
            temperature,
            searchSize,
            searchThreshold,
            responseSpeedMs,
          },
        }),
      }
    );

    if (response.ok) {
      setAlertMessage({
        message: "Your organization was created successfully",
        type: AlertType.Success,
      });
      setFormOpen(false);
      loadOrganizations();
    } else {
      setAlertMessage({
        message: "There was an error creating your organization",
        type: AlertType.Error,
      });
    }
  };

  const deleteOrganization = async (organizationId: string) => {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/organization?organizationId=${organizationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!response.ok) {
      setAlertMessage({
        message: "Unable to delete organization",
        type: AlertType.Error,
      });
    } else {
      loadOrganizations();
    }
  };

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  const handleDefaultKeyChange = () => {
    setDefaultApiKey(!defaultApiKey);

    if (!defaultApiKey) {
      setDefaultApiKeyWarningModal(true);
    }
  };

  const openForm = () => {
    setFormOpen(true);
    form.setFieldsValue({
      openAiApiKey: "",
      defaultKey: true,
      model: "gpt-3.5-turbo-1106",
      prompt: `You are a professional customer service agent who's purpose is to help and provide information based on the
context given. You will obey the following rules to the best of your ability.
1) Please answer the question at the very bottom only using the following context with as much relevant
information as you have available in the context provided.
2) Format your response to be as human friendly as possible.
3) Please provide any hyperlinks that you have available that are relevant to my question or to the answer you are providing. `,
      temperature: 50,
      searchSize: 5,
      searchThreshold: 80,
      responseSpeedMs: 20,
    });
  };

  const handleGoToDashboard = (organization: OrganizationApiDto) => {
    const organizationId = organization.id;
    localStorage.setItem("organization.id", organizationId);
    localStorage.setItem(
      "organization.permissions",
      JSON.stringify(currentPerson?.organizationPermissions[organizationId])
    );
    window.location.href = `/organization/${organizationId}/`;
  };

  let settingsVerb = "";
  if (toggleSettings) {
    settingsVerb = "Hide";
  } else {
    settingsVerb = "Show";
  }

  const handleDeleteOrg =
    (organizationId: string) => (e?: React.MouseEvent<HTMLElement>) => {
      e?.stopPropagation();
      Modal.confirm({
        title: "Are you sure you want to delete this organization?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => deleteOrganization(organizationId),
      });
    };

  return (
    <>
      <div className="center-wrapper">
        <div className="page-headers">
          <div>
            <Typography.Title level={2}>Organizations</Typography.Title>
            <Typography.Text>
              Select an existing organization, or create a new one
            </Typography.Text>
          </div>

          {currentPerson?.admin && (
            <Button
              className="addButton"
              type="primary"
              shape="circle"
              icon={<IoIosAdd size={50 * 0.8}/>}
              onClick={() => openForm()}
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
            <Divider />
          </div>
        )}

        {formOpen && (
          <>
            <Divider></Divider>
            <Form
              onFinish={submit}
              form={form}
              labelCol={{ style: { minWidth: "150px" } }}
              labelAlign="left"
            >
              <Typography.Title level={3} style={{ marginBottom: "24px" }}>
                Create a new organization
              </Typography.Title>

              <Form.Item
                name={"name"}
                label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter organization name",
                  },
                ]}
              >
                <Input placeholder="Organization Name" />
              </Form.Item>
              <Form.Item
                name={"billingEmail"}
                label="Billing Email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please enter a billing email for the organization",
                  },
                ]}
              >
                <Input placeholder="Billing Email" />
              </Form.Item>
              <Form.Item
                name={"openAiApiKey"}
                label="OpenAI API Key"
                rules={[
                  {
                    message: "Please enter OpenAI API Key",
                  },
                ]}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Input.Password
                  disabled={defaultApiKey}
                  placeholder="OpenAI Api Key"
                />
              </Form.Item>

              <Form.Item
                name="defaultKey"
                valuePropName="checked"
                initialValue={true}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Checkbox
                  style={{ marginTop: "10px" }}
                  onChange={handleDefaultKeyChange}
                >
                  Check to use default openAI Api key
                </Checkbox>
              </Form.Item>

              <Form.Item
                name={"model"}
                label="Default Model"
                rules={[
                  {
                    required: true,
                    message: "Please select model",
                  },
                ]}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Select placeholder="Select Model">
                  <Select.Option value="gpt-3.5-turbo-1106">GPT 3.5</Select.Option>
                  <Select.Option value="gpt-4">GPT 4</Select.Option>
                  <Select.Option value="gpt-4-32k">GPT 4 32k</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name={"prompt"}
                label="System Prompt"
                rules={[
                  {
                    required: true,
                    message: "Please input system prompt",
                  },
                ]}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Input.TextArea
                  rows={8}
                  placeholder="You are a friendly customer service agent who's job is to..."
                />
              </Form.Item>

              <Form.Item
                name={"searchSize"}
                label={
                  <div>
                    <Tooltip title="The maximum number of relevant search results that will be used in your prompts. We recommend 5-10 as a default.">
                      Max Search Results
                    </Tooltip>
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: "Please input maximum search relevancy results",
                  },
                ]}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Slider min={1} max={20} />
              </Form.Item>

              <Form.Item
                label={
                  <div>
                    <Tooltip title="The minimum percentage amount necessary for a search result to be considered relevant. We recommend 80-90 as a default.">
                      Search Threshold %
                    </Tooltip>
                  </div>
                }
                name={"searchThreshold"}
                rules={[
                  {
                    required: true,
                    message:
                      "Please input minimum threshold percentage for search hits",
                  },
                ]}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Slider min={1} max={100} />
              </Form.Item>

              <Form.Item
                label={
                  <div>
                    <Tooltip title="Specify a value between 1 and 200 for how creative you want the answers to be. We recommend 50 as a default.">
                      Creativity
                    </Tooltip>
                  </div>
                }
                name={"temperature"}
                rules={[
                  {
                    required: true,
                    message: "Please input a creativity percentage",
                  },
                ]}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Slider min={1} max={200} />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Response Speed{" "}
                    <BiSolidHelpCircle title="Lower is more robotic, higher is more human" />
                  </span>
                }
                name={"responseSpeedMs"}
                rules={[
                  {
                    required: true,
                    message: "Please input a response speed setting",
                  },
                ]}
                style={toggleSettings != true ? { display: "none" } : {}}
              >
                <Slider min={1} max={200} />
              </Form.Item>
              <Button
                type="primary"
                onClick={() => setToggleSettings(!toggleSettings)}
                style={{ marginBottom: "24px" }}
              >
                {settingsVerb} Advanced Settings
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: "10px" }}
              >
                <h4>Save</h4>
              </Button>
              <Button
                style={{ marginLeft: "10px" }}
                danger
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>

              <Modal
                open={defaultApiKeyWarning}
                title="Warning"
                okText="Ok"
                onOk={() => {
                  setDefaultApiKeyWarningModal(false);
                  setDefaultApiKey(true);
                }}
              >
                <p>
                  Selecting this option will overwrite the Open AI Api Key with
                  the default AMQAI key.
                </p>
              </Modal>
            </Form>
          </>
        )}
        <Divider></Divider>
        <Row gutter={[16, 16]}>
          {organizations != null &&
            organizations.map((organization) => (
              <Col xs={24} sm={12} md={8} lg={6} key={organization.id}>
                <Card
                  className="projectCard"
                  style={{ height: "150px" }}
                  title={organization.name}
                  onClick={() => handleGoToDashboard(organization)}
                  hoverable
                >
                  Total Members: {organization.members.length}
                  {currentPerson?.admin && (
                    <DeleteOutlined
                      style={{ float: "right", marginTop: "5px", color: "red" }}
                      onClick={handleDeleteOrg(organization.id)}
                    />
                  )}
                </Card>
              </Col>
            ))}
        </Row>
      </div>
    </>
  );
}

export default HomePage;
