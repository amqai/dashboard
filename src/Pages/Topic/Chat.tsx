import "../../styles/chat.css";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  Input,
  List,
  Row,
  Space,
  Spin,
  Typography,
  Alert,
  Select,
  Checkbox,
  Modal,
  theme,
  Drawer,
  Tabs,
  Descriptions,
} from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  ConversationApiDto,
  GetProjectConversationsApiResponse,
  PromptApiResponse,
} from "../../models/Conversation";
import { useNavigate, useParams } from "react-router-dom";
import NewChatForm from "../../Components/NewChatForm";
import { BsGear, BsInfoCircle } from "react-icons/bs";
import { fetchTopics } from "../../Services/ApiService";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { Topic } from "../../models/Topic";
import AddData from "../../Components/AddData";
import TabPane from "antd/es/tabs/TabPane";

const { Text, Title } = Typography;
const { useToken } = theme;

interface MessageChunk {
  id: string;
  role: string;
  content: string;
}

const ConversationItem = ({
  organizationId,
  currentConversationId,
  conversations,
  loadChats,
  setAlertMessage,
  clearMessages,
}: {
  organizationId: string;
  currentConversationId: string | undefined;
  conversations: ConversationApiDto[] | undefined;
  loadChats: any;
  setAlertMessage: React.Dispatch<React.SetStateAction<AlertModel | null>>;
  clearMessages: any;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { token } = useToken();

  const selectConversation = (conversationId: string) => {
    return () => {
      navigate(`/organization/${organizationId}/chat/${conversationId}`);
      clearMessages();
    };
  };

  const deleteConversation = async (conversationId: string) => {
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/prompt/conversation/${conversationId}?organizationId=${organizationId}`,
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
        message: "Unable to delete your conversation",
        type: AlertType.Error,
      });
    } else {
      if (conversationId == currentConversationId) {
        navigate(`/organization/${organizationId}/chat`);
      }
      loadChats();
      setAlertMessage({
        message: "Your conversation was deleted",
        type: AlertType.Success,
      });
    }
  };

  const handleClick =
    (conversationId: string) => (e?: React.MouseEvent<HTMLElement>) => {
      e?.stopPropagation();
      Modal.confirm({
        title: "Are you sure you want to delete this conversation?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => deleteConversation(conversationId),
      });
    };

  return (
    <div>
      {conversations &&
        conversations.map((conversation: ConversationApiDto, index: number) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Card
              hoverable
              style={{
                marginBottom: "16px",
                backgroundColor:
                  conversation.conversationId === currentConversationId
                    ? token.colorPrimary
                    : "",
                textAlign: "center",
              }}
              onClick={selectConversation(conversation.conversationId)}
            >
              <Text strong>{conversation.title}</Text>
              {hoveredIndex === index && (
                <DeleteOutlined
                  style={{ float: "right", marginTop: "5px", color: "red" }}
                  onClick={handleClick(conversation.conversationId)}
                />
              )}
            </Card>
          </div>
        ))}
    </div>
  );
};

function Chat() {
  const params = useParams<{
    organizationId: string;
    conversationId: string;
  }>();
  const organizationId = params.organizationId || "DEFAULT_VALUE";
  const conversationId = params.conversationId;
  const { Panel } = Collapse;
  const [promptForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [currentConversation, setCurrentConversation] =
    useState<ConversationApiDto | null>(null);
  const [messages, setMessages] = useState<PromptApiResponse[]>([]);
  const [conversations, setConversations] =
    useState<GetProjectConversationsApiResponse>();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const [projects, setProjects] = useState<Topic[] | null>(null);
  const [externalSearch, setExternalSearch] = useState(false);
  const [externalSearchWarning, setExternalSearchWarningModal] =
    useState(false);
  const [googleSearch, setGoogleSearch] = useState(false);
  const [googleSearchWarning, setGoogleSearchWarningModal] = useState(false);
  const { token } = useToken();
  const [messageChunks, setMessageChunks] = useState<MessageChunk[]>([]);
  const [promptDetailsLoading, setPromptDetailsLoading] = useState(false);
  const [promptDetailsVisible, setPromptDetailsVisible] = useState(false);
  const [promptDetails, setPromptDetails] = useState<PromptApiResponse | null>(
    null
  );

  useEffect(() => {
    (async () => {
      if (organizationId) {
        loadChats();
        loadTopics();
      }
    })();
  }, [organizationId]);

  useEffect(() => {
    (async () => {
      if (conversationId) {
        loadConversation(conversationId);
      }
    })();
  }, [conversationId]);

  const closeAdding = () => {
    setIsAdding(false);
  };

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const send = async (values: {
    prompt: string;
    projectIds: string[];
    model: string;
    googleSearch: boolean;
  }) => {
    const { prompt, projectIds, model, googleSearch } = values;
    if (googleSearch) {
      console.log("submit");
      await submit(prompt, model);
    } else {
      console.log("sendMessage");
      await sendMessage(prompt, projectIds, model);
    }
  };

  // Function to send messages to the API and receive streamed responses
  const sendMessage = async (
    prompt: string,
    projectIds: string[],
    model: string
  ) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        response: prompt,
        user: "user",
        contextList: [],
        externalSearch: true,
        promptId: "user_id",
      },
      {
        response: "",
        user: "ai",
        contextList: [],
        externalSearch: false,
        loading: true,
        promptId: "loading",
      },
    ]);
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/prompt/stream/${
        params.conversationId
      }?organizationId=${params.organizationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          prompt,
          topicIds: projectIds,
          model,
          googleSearch,
        }),
      }
    );

    const reader = response.body?.getReader();

    // Process the stream
    while (true && reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      const parts = chunk.split("\n\n");
      for (const part of parts) {
        if (part.startsWith("event:completedWithId")) {
          const completedId = part
            .replace("event:completedWithId\ndata:", "")
            .trim();
          setMessageChunks([]);
          if (completedId && messages.length > 0) {
            const updatedMessages = [...messages];
            const lastMessageIndex = updatedMessages.length - 1;
            const lastMessage = updatedMessages[lastMessageIndex];
            updatedMessages[lastMessageIndex] = {
              ...lastMessage,
              promptId: completedId,
              loading: false,
            };
            setMessages(updatedMessages);
          }
          break;
        } else if (part.startsWith("data:")) {
          try {
            const json = JSON.parse(part.replace("data:", ""));
            const message: MessageChunk = {
              id: new Date().toISOString(),
              role: json.role,
              content: json.choices[0].message.content,
            };
            setMessageChunks((prevMessages) => [...prevMessages, message]);
          } catch (e) {}
        } else {
          try {
            const json = JSON.parse(part);
            const message: MessageChunk = {
              id: new Date().toISOString(),
              role: json.role,
              content: json.choices[0].message.content,
            };
            setMessageChunks((prevMessages) => [...prevMessages, message]);
          } catch (e) {}
        }
      }
    }
    setMessageChunks([]);
  };

  const submit = async (prompt: string, model: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        response: prompt,
        user: "user",
        contextList: [],
        externalSearch: true,
        promptId: "user_id",
      },
    ]);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        response: "",
        user: "ai",
        contextList: [],
        externalSearch: false,
        loading: true,
        promptId: "loading",
      },
    ]);

    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/prompt/conversation/${
        params.conversationId
      }?organizationId=${params.organizationId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          prompt,
          topicIds: [],
          model,
          googleSearch: true,
        }),
      }
    );

    const content = await response.json();
    // Make sure to update the last message and set its loading property to false
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const lastMessageIndex = newMessages.length - 1;
      newMessages[lastMessageIndex] = {
        response: content.response,
        user: "ai",
        contextList: content.contextList,
        externalSearch: content.externalSearch,
        loading: false,
        promptId: content.promptId,
      };
      return newMessages;
    });
  };

  const loadChats = async () => {
    setLoading(true);
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/prompt/conversation?organizationId=${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();
    setConversations(content);
    setLoading(false);
  };

  const loadTopics = async () => {
    const jwt = localStorage.getItem("jwt");
    const content = await fetchTopics(jwt!, organizationId);
    if (content.status === 403 || content.data.errorCode) {
      setAlertMessage({
        message: "There was an error loading your topics",
        type: AlertType.Error,
      });
    } else {
      setProjects(content.data.topics);
    }
  };

  useEffect(() => {
    promptForm.setFieldsValue({
      projectIds: projects
        ? projects.map((project: Topic) => project.topicId)
        : [],
      model: "gpt-3.5-turbo",
      externalSearch: false,
      googleSearch: false,
    });
  }, [projects, promptForm]);

  const loadConversation = async (conversationId: string) => {
    setLoading(true);
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/prompt/conversation/${conversationId}?organizationId=${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();

    if (content && content.conversation) {
      setCurrentConversation(content.conversation);
      if (content.conversation.chat && content.conversation.chat.length > 0) {
        const newMessages = content.conversation.chat.map(
          (prompt: {
            response: any;
            user: any;
            contextList: any;
            externalSearch: boolean;
            promptId: string;
          }) => {
            return {
              response: prompt.response,
              user: prompt.user,
              contextList: prompt.contextList,
              externalSearch: prompt.externalSearch,
              promptId: prompt.promptId,
            };
          }
        );

        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      }
    }
    setLoading(false);
  };

  const onAddChat = () => {
    setIsAdding(true);
  };

  function Loading() {
    if (loading) {
      return (
        <Space size="middle">
          {" "}
          <Spin size="large" className="spinner" />{" "}
        </Space>
      );
    }
  }

  const handleDefaultKeyChange = () => {
    setExternalSearch(!externalSearch);

    if (!externalSearch) {
      promptForm.setFieldsValue({ projectIds: [] });
      setExternalSearchWarningModal(true);
    } else {
      promptForm.setFieldsValue({
        projectIds: projects
          ? projects.map((project: Topic) => project.topicId)
          : [],
        externalSearch: false,
        googleSearch: false,
      });
      setExternalSearchWarningModal(false);
    }
  };

  const handleGoogleKeyChange = () => {
    setGoogleSearch(!googleSearch);

    if (!googleSearch) {
      promptForm.setFieldsValue({ projectIds: [], googleSearch: true });
      setGoogleSearchWarningModal(true);
    } else {
      promptForm.setFieldsValue({
        projectIds: projects
          ? projects.map((project: Topic) => project.topicId)
          : [],
        externalSearch: false,
        googleSearch: false,
      });
      setGoogleSearchWarningModal(false);
    }
  };

  const handleOpenPromptDetailsDrawer = async (promptId: string) => {
    setPromptDetailsVisible(true);
    setPromptDetailsLoading(true);
    if (promptDetails !== null && promptDetails.promptId === promptId) {
      setPromptDetailsLoading(false);
      return;
    }
    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/prompt:details?organizationId=${organizationId}&promptId=${promptId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();
    setPromptDetails(content);
    setPromptDetailsLoading(false);
  };

  const handleClosePromptDetailsDrawer = async () => {
    setPromptDetailsVisible(false);
  };

  return (
    <>
      <div className="chat-container">
        <div className="chat-section">
          <div>
            <Title level={3}>Chats</Title>
          </div>
          <Button type="primary" onClick={onAddChat} style={{ width: "100%" }}>
            + New chat
          </Button>
          <Divider />
          <Input placeholder="Search chats" prefix={<SearchOutlined />} />
          <Divider />
          {conversations && (
            <div className="chat-list">
              <ConversationItem
                organizationId={organizationId}
                currentConversationId={conversationId}
                conversations={conversations.conversations}
                loadChats={loadChats}
                setAlertMessage={setAlertMessage}
                clearMessages={clearMessages}
              />
            </div>
          )}
        </div>
        <div className="prompt-section">
          {alertMessage !== null && alertMessage.message !== "" && (
            <div>
              <Alert
                message={alertMessage.message}
                onClose={dismissAlert}
                type={alertMessage.type}
                closable={true}
                style={{ width: "auto" }}
              />
              <Divider />
            </div>
          )}
          <Loading />
          <NewChatForm
            visible={isAdding}
            organizationId={organizationId}
            handleCancel={closeAdding}
            reloadChats={loadChats}
          />
          {conversationId ? (
            <Card
              style={{ height: "85vh", overflowY: "scroll", padding: "3%" }}
            >
              {currentConversation !== null && (
                <Typography.Title level={4}>
                  {currentConversation.title}
                </Typography.Title>
              )}
              <Form onFinish={send} form={promptForm}>
                <Row align="middle" style={{ marginBottom: "1rem" }}>
                  <Col flex="auto">
                    <Form.Item style={{ marginBottom: 0 }} name={"prompt"}>
                      <Input.TextArea
                        placeholder="Ask my anything about my data"
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        onPressEnter={(e) => {
                          // Prevent default behavior of Enter key in TextArea
                          e.preventDefault();
                          promptForm.submit();
                        }}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Button
                      htmlType="submit"
                      type="primary"
                      style={{ marginLeft: "1rem" }}
                      size="large"
                    >
                      Ask Question
                    </Button>
                    <Button
                      style={{ marginLeft: "1rem" }}
                      onClick={() => setIsSettingsVisible(!isSettingsVisible)}
                      size="large"
                    >
                      <BsGear />
                    </Button>
                  </Col>
                </Row>
                <div hidden={!isSettingsVisible} style={{ margin: "3%" }}>
                  <Typography.Text style={{ fontStyle: "italic" }}>
                    Select topics to search on
                  </Typography.Text>
                  <Row
                    align="middle"
                    style={{ marginBottom: "1rem", marginTop: ".5rem" }}
                  >
                    <Col flex="auto">
                      <Form.Item name={"projectIds"}>
                        <Select
                          mode="multiple"
                          placeholder="Select Topics"
                          optionLabelProp="label"
                          disabled={externalSearch || googleSearch}
                        >
                          {projects &&
                            projects.map((project: Topic) => (
                              <Select.Option
                                style={{ marginBottom: "5px" }}
                                value={project.topicId}
                                label={project.topicName}
                                key={project.topicId}
                              >
                                {project.topicName}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name={"externalSearch"}
                        valuePropName="checked"
                      >
                        <Checkbox
                          style={{ marginTop: "5px" }}
                          onChange={handleDefaultKeyChange}
                          disabled={googleSearch}
                        >
                          Query base model knowledge only
                        </Checkbox>
                      </Form.Item>
                      <Form.Item name={"googleSearch"} valuePropName="checked">
                        <Checkbox
                          style={{ marginTop: "5px" }}
                          onChange={handleGoogleKeyChange}
                          disabled={externalSearch}
                        >
                          Query Google only
                        </Checkbox>
                      </Form.Item>
                      <Form.Item
                        name={"model"}
                        style={{ marginBottom: 0 }}
                        rules={[
                          {
                            message: "Please select model",
                          },
                        ]}
                      >
                        <Select placeholder="Select Model">
                          <Select.Option value="gpt-3.5-turbo">
                            GPT 3.5
                          </Select.Option>
                          <Select.Option value="gpt-3.5-turbo-16k">
                            GPT 3.5 Turbo 16k
                          </Select.Option>
                          <Select.Option value="gpt-4">GPT 4</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Form>
              <Divider />
              <List
                dataSource={[...messages].reverse()}
                renderItem={(message, index) => (
                  <List.Item
                    style={{
                      paddingTop: "24px",
                      paddingBottom: "24px",
                      borderRadius: "10px",
                      backgroundColor:
                        message.user === "ai"
                          ? token.colorBgElevated
                          : token.colorFillSecondary,
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          marginLeft: "10px",
                          marginRight: "10px",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            height: "50px",
                            width: "50px",
                            margin: "10px",
                            backgroundColor: "#AF82F5",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {message.user === "ai" && (
                            <div>A</div>
                            // <Tag icon={<GiBrain/>}/>
                          )}
                          {message.user === "user" && (
                            // <Tag icon={<BsFillPersonFill/>} />
                            <div>Q</div>
                          )}
                        </div>
                        <div style={{ textAlign: "justify", flex: "1" }}>
                          {message.user === "user" ? (
                            message.response
                          ) : (
                            <pre
                              style={{
                                overflowY: "auto",
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                width: "100%",
                                margin: "10px",
                                padding: "10px",
                              }}
                            >
                              {message.loading && messageChunks.length > 0 ? (
                                messageChunks.map((m) => m.content)
                              ) : (
                                <>
                                  {message.loading ? (
                                    <Spin size="default" />
                                  ) : (
                                    message.response
                                  )}
                                </>
                              )}
                            </pre>
                          )}
                        </div>
                      </div>

                      {message.user === "ai" &&
                        message.promptId !== "loading" &&
                        !message.response.includes(
                          "I am unable to answer your question"
                        ) && (
                          <div style={{ margin: "16px 24px 0 24px" }}>
                            <BsInfoCircle style={{ margin: "0 16px 0 0" }} />
                            <a
                              onClick={() =>
                                handleOpenPromptDetailsDrawer(message.promptId)
                              }
                            >
                              How did we get this answer?
                            </a>
                          </div>
                        )}
                      {message.user === "ai" &&
                        message.externalSearch &&
                        message.response &&
                        !message.response.includes(
                          "I am unable to answer your question"
                        ) && (
                          <AddData
                            organizationId={organizationId}
                            topics={projects}
                            data={message.response}
                          />
                        )}
                    </div>
                  </List.Item>
                )}
              ></List>
              <Modal
                open={externalSearchWarning}
                title="Warning"
                okText="Ok"
                onCancel={() => {
                  handleDefaultKeyChange();
                }}
                onOk={() => {
                  setExternalSearchWarningModal(false);
                  setExternalSearch(true);
                }}
              >
                <p>Selecting this option can have unpredictable answers.</p>
              </Modal>
              <Modal
                open={googleSearchWarning}
                title="Warning"
                okText="Ok"
                onCancel={() => {
                  handleGoogleKeyChange();
                }}
                onOk={() => {
                  setGoogleSearchWarningModal(false);
                  setGoogleSearch(true);
                }}
              >
                <p>
                  Selecting this option can have unpredictable answers and can
                  incur high costs.
                </p>
              </Modal>
            </Card>
          ) : (
            <div>
              <p>Load most recent chat here</p>
            </div>
          )}
        </div>
      </div>
      {promptDetails && (
        <Drawer
          open={promptDetailsVisible}
          onClose={handleClosePromptDetailsDrawer}
          placement="bottom"
        >
          {promptDetailsLoading ? (
            <Spin size="large" />
          ) : (
            <Tabs>
              {promptDetails.contextList.map((context, index) => (
                <TabPane
                  tab={index + 1 + "/" + promptDetails.contextList.length}
                  key={index}
                >
                  {promptDetails.externalSearch ? (
                    <>Insert Links here</>
                  ) : (
                    <Descriptions>
                      <Descriptions.Item label="Topic">
                        {context.topic.name}
                      </Descriptions.Item>
                      <Descriptions.Item label="Identifier">
                        {context.identifier}
                      </Descriptions.Item>
                      <Descriptions.Item label="Score">
                        {context.score}
                      </Descriptions.Item>
                      <Descriptions.Item label="Data">
                        {context.data}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </TabPane>
              ))}
            </Tabs>
          )}
        </Drawer>
      )}
    </>
  );
}

export default Chat;
