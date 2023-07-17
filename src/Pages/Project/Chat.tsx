import  "../../styles/chat.css";
import { Button, Card, Col, Collapse, Divider, Form, Input, List, Row, Space, Spin, Table, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ConversationApiDto, GetProjectConversationsApiResponse, PromptApiResponse } from "../../models/Conversation";
import { useParams } from "react-router-dom";
import NewChatForm from "../../Components/NewChatForm";
import { GiBrain } from "react-icons/gi";
import { BsFillPersonFill } from "react-icons/bs";

const { Text, Title } = Typography;

const ConversationItem = ({projectId, conversations}: {projectId: string, conversations: ConversationApiDto[] | undefined}) => {

    const selectConversation = (conversationId: string) => {
      return () => {
        window.location.href = `/project/${projectId}/chat/${conversationId}`;
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
              <div>
                <Text>{conversation.model}</Text>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
};

function Chat() {
    const params = useParams<{ projectId: string, conversationId: string }>();
    const projectId = params.projectId || 'default_value';
    const conversationId = params.conversationId || 'default_value';
    const { Panel } = Collapse;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [messages, setMessages] = useState<PromptApiResponse[]>([]);
    const [conversations, setConversations] = useState<GetProjectConversationsApiResponse>();

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
            if (projectId) {
              loadChats();
            }
          }
          )();
      }, [projectId]);

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

    const submit = async (values: { prompt: string }) => {
      const { prompt } = values;
      setMessages(prevMessages => [...prevMessages, {response: prompt, user: "user", contextList: []}]);
        const jwt = localStorage.getItem('jwt');        
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/${projectId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                prompt,
                conversationId,
            })
        });
  
        const content = await response.json();
        setMessages(prevMessages => [...prevMessages, {response: content.response, user: "ai", contextList: content.contextList}]);
    }

    const loadChats = async () => {
        setLoading(true);
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/${projectId}/conversation`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });

        const content = await response.json();
        setConversations(content);
        setLoading(false);
    }

    const loadConversation = async () => {
      const jwt = localStorage.getItem('jwt');
              const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/${projectId}/conversation/${conversationId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwt}`
                }
              });
      
              const content = await response.json();
      
              const newMessages = content.conversation.chat.map((prompt: { response: any; user: any; contextList: any; }) => {
                return {
                  response: prompt.response,
                  user: prompt.user,
                  contextList: prompt.contextList,
                }
              });
      
              setMessages(prevMessages => [...prevMessages, ...newMessages]);
    }

    const onAddChat = () => {
      form.resetFields();
      setIsAdding(true);
    }

    function Loading() {
      if(loading) {
        return <Space size="middle"> <Spin size="large" className="spinner" /> </Space>
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
                <ConversationItem projectId={projectId} conversations={conversations.conversations}/>
            </div>
        )}
      </div>
      <div className="prompt-section">
        <Loading />
        <NewChatForm
          form={form} 
          visible={isAdding} 
          projectId={projectId} 
          handleCancel={closeAdding} 
          reloadChats={loadChats} 
        />
        <Card style={{ maxHeight: '90vh', overflowY: 'scroll' }}>
          <Form onFinish={submit}>
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
                  htmlType="submit"
                  type="primary"
                  style={{marginLeft:"1rem"}}
                >Ask Question</Button>
              </Col>
            </Row>
          </Form>
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
                    {message.user === 'ai' && message.contextList &&
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
        </Card>
      </div>
    </div>
  );
};

export default Chat;
