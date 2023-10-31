import  "../../styles/chat.css";
import { Button, Card, Col, Collapse, Divider, Form, Input, List, Row, Space, Spin, Table, Typography, Alert, Select, Checkbox, Modal, theme } from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ConversationApiDto, GetProjectConversationsApiResponse, PromptApiResponse } from "../../models/Conversation";
import { useNavigate, useParams } from "react-router-dom";
import NewChatForm from "../../Components/NewChatForm";
import { BsGear } from "react-icons/bs";
import { fetchTopics } from "../../Services/ApiService";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { Topic } from "../../models/Topic";
import AddData from "../../Components/AddData";


const { Text, Title } = Typography;
const { useToken } = theme;

const ConversationItem = ({organizationId, currentConversationId, conversations, loadChats, setAlertMessage, clearMessages}: {organizationId: string, currentConversationId: string | undefined, conversations: ConversationApiDto[] | undefined, loadChats: any, setAlertMessage: React.Dispatch<React.SetStateAction<AlertModel | null>>, clearMessages: any}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const navigate = useNavigate();
    const { token } = useToken();

    const selectConversation = (conversationId: string) => {
      return () => {
        navigate(`/organization/${organizationId}/chat/${conversationId}`);
        clearMessages();
      };
    }

    const deleteConversation = async (conversationId: string) => {
      const jwt = localStorage.getItem('jwt');        
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/conversation/${conversationId}?organizationId=${organizationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });
      if (!response.ok) {
        setAlertMessage({
          message: 'Unable to delete your conversation',
          type: AlertType.Error,
        })
      } else {
        if (conversationId == currentConversationId) {
          navigate(`/organization/${organizationId}/chat`);
        }
        loadChats();
        setAlertMessage({
          message: 'Your conversation was deleted',
          type: AlertType.Success,
        })
      }
    }

    const handleClick = (conversationId: string) => (e?: React.MouseEvent<HTMLElement>) => {
      e?.stopPropagation();
      Modal.confirm({
        title: 'Are you sure you want to delete this conversation?',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => deleteConversation(conversationId),
      });
    }

    return (
      <div>
        {conversations && conversations.map((conversation: ConversationApiDto, index: number) => (
          <div 
            key={index} 
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Card 
              hoverable
              style={{
                marginBottom: "16px",
                backgroundColor: conversation.conversationId === currentConversationId ? token.colorPrimary : '',
                textAlign: "center"
              }}
              onClick={selectConversation(conversation.conversationId)}
            >
              <Text strong>{conversation.title}</Text>
              {hoveredIndex === index && (
                <DeleteOutlined 
                  style={{ float: 'right', marginTop: '5px', color: 'red' }} 
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
    const params = useParams<{ organizationId: string, conversationId: string }>();
    const organizationId = params.organizationId || "DEFAULT_VALUE"
    const conversationId = params.conversationId;
    const { Panel } = Collapse;
    const [promptForm] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [currentConversation, setCurrentConversation] = useState<ConversationApiDto | null>(null);
    const [messages, setMessages] = useState<PromptApiResponse[]>([]);
    const [conversations, setConversations] = useState<GetProjectConversationsApiResponse>();
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
    const [projects, setProjects] = useState<Topic[] | null>(null);
    const [externalSearch, setExternalSearch] = useState(false);
    const [externalSearchWarning, setExternalSearchWarningModal] = useState(false);
    const [googleSearch, setGoogleSearch] = useState(false);
    const [googleSearchWarning, setGoogleSearchWarningModal] = useState(false);
    const { token } = useToken();

    const contextColumns = [
      {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        render: (score: string) => `${parseFloat(score) * 100}%`,
      },
      {
        title: 'Identifier',
        dataIndex: 'identifier',
        key: 'identifier',
      },
      {
        title: 'Data',
        dataIndex: 'data',
        key: 'data',
      },
    ];

    useEffect(() => {
        (
          async () => {
            if (organizationId) {
              loadChats();
              loadTopics();
            }
          }
          )();
      }, [organizationId]);

    useEffect(() => {
        (
          async () => {
            if (conversationId) {
              loadConversation(conversationId);
            }
          }
          )();
      }, [conversationId]);

    const closeAdding = () => {
        setIsAdding(false);
    };

    const dismissAlert = () => {
      setAlertMessage(null);
    };

    const clearMessages = () => {
      setMessages([]);
    }

    const submit = async (values: { prompt: string, projectIds: string[], model: string, googleSearch: boolean }) => {
      const { prompt, projectIds, model, googleSearch } = values;
      setMessages(prevMessages => [...prevMessages, {response: prompt, user: "user", contextList: [], externalSearch: true}]);
      setMessages(prevMessages => [...prevMessages, {response: "", user: "ai", contextList: [], externalSearch: false, loading: true}]);

      const jwt = localStorage.getItem('jwt');        
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/conversation/${conversationId}?organizationId=${organizationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
              prompt,
              conversationId,
              projectIds,
              model,
              googleSearch,
          })
      });

      const content = await response.json();
      // Make sure to update the last message and set its loading property to false
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessageIndex = newMessages.length - 1;
        newMessages[lastMessageIndex] = {response: content.response, user: "ai", contextList: content.contextList, externalSearch: content.externalSearch, loading: false};
        return newMessages;
      });
    }

    const loadChats = async () => {
        setLoading(true);
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/conversation?organizationId=${organizationId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        const content = await response.json();
        setConversations(content);
        setLoading(false);
    }

    const loadTopics = async () => {
      const jwt = localStorage.getItem('jwt');
      const content = await fetchTopics(jwt!, organizationId);
      if (content.status === 403 || content.data.errorCode) {
          setAlertMessage({
              message: 'There was an error loading your topics',
              type: AlertType.Error,
            })
      } else {
          setProjects(content.data.projects);
      }
    }

    useEffect(() => {
      promptForm.setFieldsValue({
        projectIds: projects ? projects.map((project: Topic) => project.projectId) : [],
        model: 'gpt-3.5-turbo',
        externalSearch: false,
        googleSearch: false,
      });
  }, [projects, promptForm]);

    const loadConversation = async (conversationId: string) => {
      setLoading(true);
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/conversation/${conversationId}?organizationId=${organizationId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      const content = await response.json();

      if (content && content.conversation) {
        setCurrentConversation(content.conversation);
        if (content.conversation.chat && content.conversation.chat.length > 0) {
          const newMessages = content.conversation.chat.map((prompt: { response: any; user: any; contextList: any; externalSearch: boolean; }) => {
            return {
              response: prompt.response,
              user: prompt.user,
              contextList: prompt.contextList,
              externalSearch: prompt.externalSearch,
            }
          });

          setMessages(prevMessages => [...prevMessages, ...newMessages]);
        }
      }
      setLoading(false);
    }

    const onAddChat = () => {
      setIsAdding(true);
    }

    function Loading() {
      if(loading) {
        return <Space size="middle"> <Spin size="large" className="spinner" /> </Space>
      }
    }

    const handleDefaultKeyChange = () => {
      setExternalSearch(!externalSearch)

      if(!externalSearch) {
        promptForm.setFieldsValue({projectIds: []});
        setExternalSearchWarningModal(true)
      } else {
        promptForm.setFieldsValue({
          projectIds: projects ? projects.map((project: Topic) => project.projectId) : [],
          externalSearch: false,
          googleSearch: false,
        })
        setExternalSearchWarningModal(false)
      }
    }

    const handleGoogleKeyChange = () => {
      setGoogleSearch(!googleSearch)

      if(!googleSearch) {
        promptForm.setFieldsValue({projectIds: [], googleSearch: true});
        setGoogleSearchWarningModal(true)
      } else {
        promptForm.setFieldsValue({
          projectIds: projects ? projects.map((project: Topic) => project.projectId) : [],
          externalSearch: false,
          googleSearch: false,
        })
        setGoogleSearchWarningModal(false)
      }
    }

  return (
    <div className="chat-container">
      <div className="chat-section">
        <div>
            <Title level={3}>Chats</Title>
        </div>
        <Button 
          type="primary"
          onClick={onAddChat}
          style={{width: "100%"}}
        >+ New chat</Button>
        <Divider />
        <Input
            placeholder="Search chats"
            prefix={<SearchOutlined/>}
        />
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
            style={{width: "auto"}}/>
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
        <Card style={{height: "85vh", overflowY: 'scroll', padding: "3%"}}> 
          {currentConversation !== null && (
            <Typography.Title level={4}>{currentConversation.title}</Typography.Title>
          )}
          <Form onFinish={submit} form={promptForm}>
            <Row 
              align="middle"
              style={{ marginBottom: '1rem' }}
            >
              <Col flex="auto">
                <Form.Item 
                  style={{ marginBottom: 0 }}
                  name={"prompt"}
                >
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
                  style={{marginLeft:"1rem"}}
                  size="large"
                >Ask Question</Button>
                <Button
                  style={{marginLeft:"1rem"}}
                  onClick={() => setIsSettingsVisible(!isSettingsVisible)}
                  size="large"
                ><BsGear /></Button>
              </Col>
            </Row>
            <div hidden={!isSettingsVisible} style={{margin: "3%"}}>
              <Typography.Text style={{fontStyle: "italic"}}>Select topics to search on</Typography.Text>
              <Row 
                align="middle"
                style={{ marginBottom: '1rem', marginTop:'.5rem' }}
              >
                <Col flex="auto">
                <Form.Item 
                  name={"projectIds"}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select Topics"
                    optionLabelProp="label"
                    disabled={externalSearch || googleSearch}
                  >
                    {projects && projects.map((project: Topic) => (
                      <Select.Option style={{marginBottom: "5px"}} value={project.projectId} label={project.projectName} key={project.projectId}>
                        {project.projectName}
                      </Select.Option>
                    ))}
                  </Select>
                  </Form.Item>
                  <Form.Item
                    name={"externalSearch"}
                    valuePropName="checked"
                    >
                    <Checkbox
                      style={{marginTop: "5px"}}
                      onChange={handleDefaultKeyChange}
                      disabled={googleSearch}
                    >Query base model knowledge only</Checkbox>
                  </Form.Item>
                  <Form.Item
                    name={"googleSearch"}
                    valuePropName="checked"
                    >
                    <Checkbox
                      style={{marginTop: "5px"}}
                      onChange={handleGoogleKeyChange}
                      disabled={externalSearch}
                    >Query Google only</Checkbox>
                  </Form.Item>
                  <Form.Item
                    name={"model"}
                    style={{ marginBottom: 0 }}
                    rules={[
                        {
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
                </Col>
              </Row>
            </div>
          </Form>
          <Divider />
          <List 
            dataSource={[...messages].reverse()}
            renderItem={(message, index) => 
              <List.Item 
                style={{
                    paddingTop: "24px",
                    paddingBottom: "24px",
                    borderRadius: "10px",
                    backgroundColor: message.user === 'ai' ? token.colorBgElevated : token.colorFillSecondary,
                    marginTop: "10px",
                    marginBottom: "10px",
                }}
              >
                <div>
                  <div 
                  style={{display: "flex", 
                  marginLeft: "10px", 
                  marginRight: "10px",
                  justifyContent: "center",
                  alignItems: "center"
                  }}>
                      <div style={{
                        height: "50px", 
                        width: "50px",
                        margin: "10px",
                        backgroundColor: '#AF82F5',
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                        }}>
                        {message.user === 'ai' && (
                          <div>A</div>
                          // <Tag icon={<GiBrain/>}/>
                        )}
                        {message.user === 'user' && (
                          // <Tag icon={<BsFillPersonFill/>} />
                          <div>Q</div>
                        )}
                      </div>
                      <div style={{textAlign: "justify", flex: "1"}}>
                        {message.loading ? (
                          <Spin size="default" />
                        ) : (
                          <>
                            {message.user === "user" ? (
                              message.response
                            ) : (
                              <pre 
                              style={{overflowY:"auto", whiteSpace: "pre-wrap", wordWrap: "break-word", width: "100%", margin: "10px", padding: "10px"}}
                            >{message.response}</pre>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                
                    {message.user === 'ai' && !message.externalSearch && message.contextList && !message.loading &&
                      <Collapse style={{margin: "16px 24px 0 24px"}}>
                          <Panel header="Show context list" key={index}>
                              <Table
                                  style={{width:"100%"}}
                                  size="large"
                                  tableLayout="auto"
                                  pagination={false}
                                  columns={contextColumns}
                                  dataSource={message.contextList}
                              />
                          </Panel>
                      </Collapse>
                    }
                    {message.user === 'ai' && message.externalSearch && message.response && !message.response.includes("I am unable to answer your question") && (
                    <AddData
                      organizationId={organizationId}
                      topics={projects}
                      data={message.response}
                    />
                    )}
                  </div>
              </List.Item>
            }
          >
          </List>
          <Modal
              open={externalSearchWarning}
              title="Warning"
              okText="Ok"
              onCancel={() => {
                handleDefaultKeyChange()
              }}
              onOk={() => {
                setExternalSearchWarningModal(false)
                setExternalSearch(true)
              }}
          >
              <p>Selecting this option can have unpredictable answers.</p>
          </Modal>
          <Modal
              open={googleSearchWarning}
              title="Warning"
              okText="Ok"
              onCancel={() => {
                handleGoogleKeyChange()
              }}
              onOk={() => {
                setGoogleSearchWarningModal(false)
                setGoogleSearch(true)
              }}
          >
              <p>Selecting this option can have unpredictable answers and can incur high costs.</p>
          </Modal>
        </Card>
        ) : (
          <div>
            <p>Load most recent chat here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
