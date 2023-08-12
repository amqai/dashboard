import  "../../styles/chat.css";
import { Button, Card, Col, Collapse, Divider, Form, Input, List, Row, Space, Spin, Table, Tag, Typography, Alert, Select, Checkbox, Modal } from "antd";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ConversationApiDto, GetProjectConversationsApiResponse, PromptApiResponse } from "../../models/Conversation";
import { useNavigate, useParams } from "react-router-dom";
import NewChatForm from "../../Components/NewChatForm";
import { GiBrain } from "react-icons/gi";
import { BsFillPersonFill } from "react-icons/bs";
import { GrSettingsOption } from "react-icons/gr";
import { fetchProjects } from "../../Services/ApiService";
import { Alert as AlertModel, AlertType } from "../../models/Alert";
import { Topic } from "../../models/Topic";
import AddData from "../../Components/AddData";


const { Text, Title } = Typography;

const ConversationItem = ({organizationId, currentConversationId, conversations, loadChats, setAlertMessage, clearMessages}: {organizationId: string, currentConversationId: string | undefined, conversations: ConversationApiDto[] | undefined, loadChats: any, setAlertMessage: React.Dispatch<React.SetStateAction<AlertModel | null>>, clearMessages: any}) => {

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const navigate = useNavigate();

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
        title: 'Are you sure to delete this conversation?',
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
                backgroundColor: conversation.conversationId === currentConversationId ? '#e6f7ff' : '',
                border: conversation.conversationId === currentConversationId ? '2px solid #1890ff' : ''
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
    const [newChatForm] = Form.useForm();
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
      const content = await fetchProjects(jwt!, organizationId);
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
      newChatForm.resetFields();
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
            <Title level={5}>Chats</Title>
        </div>
        <Input
            placeholder="Search chats"
            prefix={<SearchOutlined />}
        />
        <Divider />
        <Button 
          type="primary"
          onClick={onAddChat}
        >+ New chat</Button>
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
            <Alert message={alertMessage.message} onClose={dismissAlert} type={alertMessage.type} closable={true} />
            <Divider />
            </div>
        )}
        <Loading />
        <NewChatForm
          form={newChatForm} 
          visible={isAdding} 
          organizationId={organizationId} 
          handleCancel={closeAdding} 
          reloadChats={loadChats} 
        />
        {conversationId ? (
          <Card style={{ maxHeight: '90vh', overflowY: 'scroll' }}> 
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
                    rows={1}
                    placeholder="Ask my anything about my data"
                  />
                </Form.Item>
              </Col>
              <Col>
                <Button
                  style={{marginLeft:"1rem"}}
                  onClick={() => setIsSettingsVisible(!isSettingsVisible)}
                ><GrSettingsOption /></Button>
                <Button
                  htmlType="submit"
                  type="primary"
                  style={{marginLeft:"1rem"}}
                >Ask Question</Button>
              </Col>
            </Row>
            <Row 
              align="middle"
              style={{ marginBottom: '1rem' }}
              hidden={!isSettingsVisible}
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
                    <Select.Option value={project.projectId} label={project.projectName} key={project.projectId}>
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
                  style={{marginTop: "10px"}}
                  onChange={handleDefaultKeyChange}
                  disabled={googleSearch}
                >Query base model knowledge only</Checkbox>
              </Form.Item>
              <Form.Item
                name={"googleSearch"}
                valuePropName="checked"
                >
                <Checkbox
                  style={{marginTop: "10px"}}
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
                  <Select.Option value="gpt-4-32k">GPT 4 32k</Select.Option>
                </Select>
              </Form.Item>
              </Col>
            </Row>
          </Form>
          <Divider />
          <List 
            dataSource={[...messages].reverse()}
            renderItem={(message, index) => 
              <List.Item 
                style={{
                    paddingTop: "24px",
                    paddingBottom: "24px",
                    backgroundColor: message.user === 'ai' ? 'rgba(39,0,102,0.03)' : 'inherit'
                }}
              >
                <div>
                  <div style={{display: "flex", alignItems: "flex-start"}}>
                      <div>
                        {message.user === 'ai' && (
                          <Tag icon={<GiBrain />} color="rgb(39,0,102)" />
                        )}
                        {message.user === 'user' && (
                          <Tag icon={<BsFillPersonFill color="#55acee" />} />
                        )}
                      </div>
                      <div style={{marginLeft: "10px", textAlign: "justify", flex: "1"}}>
                        {message.loading ? (
                          <Spin size="default" />
                        ) : (
                          <>
                            {message.user === "user" ? (
                              message.response
                            ) : (
                              <pre 
                              style={{overflowY:"auto", whiteSpace: "pre-wrap", wordWrap: "break-word", marginRight: "5%", width: "100%"}}
                            >{message.response}</pre>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {message.user === 'ai' && !message.externalSearch && message.contextList && !message.loading &&
                      <Collapse style={{margin: "16px 0 0 24px"}}>
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
          <div style={{minHeight: '92vh'}}>Please select a chat or <Button onClick={onAddChat}>Start a new chat</Button></div>
        )}
      </div>
    </div>
  );
};

export default Chat;
