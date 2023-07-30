import  "../../styles/chat.css";
import { Button, Card, Col, Collapse, Divider, Form, Input, List, Row, Space, Spin, Table, Tag, Typography, Alert, Select, Checkbox, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ConversationApiDto, GetProjectConversationsApiResponse, PromptApiResponse } from "../../models/Conversation";
import { useParams } from "react-router-dom";
import NewChatForm from "../../Components/NewChatForm";
import { GiBrain } from "react-icons/gi";
import { BsFillPersonFill } from "react-icons/bs";
import { GrSettingsOption } from "react-icons/gr";
import { fetchProjects } from "../../Services/ApiService";
import { Alert as AlertModel, AlertType } from "../../models/Alert";

const { Text, Title } = Typography;

interface Project {
  projectName: string,
  projectDescription: string,
  projectId: string,
}

const ConversationItem = ({organizationId, conversations}: {organizationId: string, conversations: ConversationApiDto[] | undefined}) => {

    const selectConversation = (conversationId: string) => {
      return () => {
        window.location.href = `/organization/${organizationId}/chat/${conversationId}`;
      };
    }

    return (
      <div>
        {conversations && conversations.map((conversation: ConversationApiDto, index: number) => (
          <div key={index}>
            <Card 
              hoverable
              style={{marginBottom: "16px"}}
              onClick={selectConversation(conversation.conversationId)}
            >
              <Text strong>{conversation.title}</Text>
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
    const [messages, setMessages] = useState<PromptApiResponse[]>([]);
    const [conversations, setConversations] = useState<GetProjectConversationsApiResponse>();
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [externalSearch, setExternalSearch] = useState(false);
    const [externalSearchWarning, setExternalSearchWarningModal] = useState(false);

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
              loadConversation();
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

    const submit = async (values: { prompt: string, projectIds: string[], model: string }) => {
      const { prompt, projectIds, model } = values;
      setMessages(prevMessages => [...prevMessages, {response: prompt, user: "user", contextList: [], externalSearch: true}]);
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
            })
        });
  
        const content = await response.json();
        setMessages(prevMessages => [...prevMessages, {response: content.response, user: "ai", contextList: content.contextList, externalSearch: content.externalSearch}]);
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
        projectIds: projects ? projects.map((project: Project) => project.projectId) : [],
        model: 'gpt-3.5-turbo',
        externalSearch: false,
      });
  }, [projects, promptForm]);

    const loadConversation = async () => {
      setLoading(true);
      const jwt = localStorage.getItem('jwt');
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/conversation/${conversationId}?organizationId=${organizationId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      const content = await response.json();

      if (content && content.conversation && content.conversation.chat && content.conversation.chat.length > 0){
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
          projectIds: projects ? projects.map((project: Project) => project.projectId) : [],
          externalSearch: false,
        })
        setExternalSearchWarningModal(false)
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
                <ConversationItem organizationId={organizationId} conversations={conversations.conversations}/>
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
                  disabled={externalSearch}
                >
                  {projects && projects.map((project: Project) => (
                    <Select.Option value={project.projectId} label={project.projectName} key={project.projectId}>
                      {project.projectName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="externalSearch"
                valuePropName="checked"
                initialValue={true}
                >
                <Checkbox style={{marginTop: "10px"}} onChange={handleDefaultKeyChange}>Query base model knowledge only</Checkbox>
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
                        {message.response}
                      </div>
                    </div>
                    {message.user === 'ai' && !message.externalSearch && message.contextList &&
                        <Collapse bordered={false} ghost>
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
        </Card>
        ) : (
          <div style={{minHeight: '92vh'}}>Please select a chat or <Button onClick={onAddChat}>Start a new chat</Button></div>
        )}
      </div>
    </div>
  );
};

export default Chat;
