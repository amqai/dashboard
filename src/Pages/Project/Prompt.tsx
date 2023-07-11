import { Button, Card, Col, Collapse, Form, Input, List, Row, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GiBrain } from "react-icons/gi";
import { BsFillPersonFill } from "react-icons/bs";

interface Message {
    response: string,
    user: string,
    contextList: Context[],
}
  
interface Context {
    identifier: string,
    data: string,
    score: string,
}

function Prompt() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const { Panel } = Collapse;
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
    (async () => {
      if (projectId) {
        try {
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/prompt/${projectId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });
  
          const content = await response.json();
  
          const newMessages = content.prompts.map((prompt: { response: any; user: any; contextList: any; }) => {
            return {
              response: prompt.response,
              user: prompt.user,
              contextList: prompt.contextList,
            }
          });
  
          setMessages(prevMessages => [...prevMessages, ...newMessages]);
        } catch (e) {
          navigate('/logout');
        }
      }
    })();
  }, [projectId]);

  return (
    <div className="wrapper-100vh">
      <div className="center-wrapper">
        <Typography.Title level={2}>Chat</Typography.Title>
        <Typography.Text italic={true}>Talk to the data in your project</Typography.Text>
        <Card>
          <Form>
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
                  type="primary"
                  style={{marginLeft:"1rem"}}
                >Ask Question</Button>
              </Col>
            </Row>
          </Form>
          <List
            dataSource={messages.reverse()}
            renderItem={(message, index) => 
              <List.Item 
                style={{
                    paddingTop: "24px",
                    paddingBottom: "24px",
                    backgroundColor: message.user === 'ai' ? 'rgba(39,0,102,0.03)' : 'inherit'
                }}
              >
                <div>
                    {message.user === 'ai' && (
                        <Tag icon={<GiBrain />} color="rgb(39,0,102)" />
                    )}
                    {message.user === 'user' && (
                        <Tag icon={<BsFillPersonFill color="#55acee" />} />
                    )}
                    {message.response}
                    {message.user === 'ai' && message.contextList &&
                        <Collapse bordered={false} ghost>
                            <Panel header="Show context list" key={index}>
                                <List
                                dataSource={message.contextList}
                                renderItem={context =>
                                    <List.Item>
                                    <Table
                                        style={{width:"100%"}}
                                        size="large"
                                        tableLayout="auto"
                                        pagination={false}
                                        columns={contextColumns}
                                        dataSource={[context]} // Wrap context object into an array
                                    />
                                    </List.Item>
                                }
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
}

export default Prompt;