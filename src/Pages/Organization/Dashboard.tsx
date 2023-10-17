import { Typography, Spin, Space, Table, Form, Button, Input, Alert, Card } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";
import { OrganizationApiDto } from "../../models/Organization";
import { FrequentlyAskedQuestionsResponse } from "../../models/FrequentQuestions";
import { QuestionsOverrideResponse } from "../../models/QuestionOverride";


function Dashboard() {
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(null);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequentlyAskedQuestionsResponse | null>(null);
  // const [questionsOverride, setQuestionsOverride] = useState<QuestionsOverrideResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('');

  const [questionsOverride, setQuestionsOverride] = useState<QuestionsOverrideResponse>({
    questions: [],
  });


  const [loading, setLoading] = useState(false);

  // Get organization
  useEffect(() => {
    (
      async () => {
        if (organizationId) {
          setLoading(true);
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization?organizationId=${organizationId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const content = await response.json();
          setOrganization(content)
          setLoading(false);
        }
      }
      )();
  }, [organizationId]);

  useEffect(() => {
    (
      async () => {
        if (organizationId) {
          setLoading(true);
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/frequent-questions?organizationId=${organizationId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const content = await response.json();
          setFrequentQuestions(content)
          setLoading(false);
        }
      }
      )();
  }, [organizationId]);

  useEffect(() => {
    (
      async () => {
        if (organizationId) {
          setLoading(true);
          const jwt = localStorage.getItem('jwt');
          const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/question-override?organizationId=${organizationId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          });

          const content = await response.json();
          setQuestionsOverride(content)
          setLoading(false);
        }
      }
      )();
  }, [organizationId]);

  const addQuestionToOverride = async (values: { question: string; answer: string }) => {
    setLoading(true);
    const jwt = localStorage.getItem('jwt');
    const { question, answer } = values;
    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/question-override?organizationId=${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        question,
        answer,
      })
    });
    const content = await response.json();
    if (content.errorCode) {
      setErrorMessage(content.errorCode)
    } else {
      const updatedQuestions = [
        ...questionsOverride.questions,
        { question: content.question, answer: content.answer },
      ];
      
      setQuestionsOverride({questions: updatedQuestions});
    }

    setLoading(false);
  }

  const deleteOverrideQuestion = async (question: string) => {
    setLoading(true);
    const jwt = localStorage.getItem('jwt');

    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/question-override?organizationId=${organizationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        question,
      })
    });
    const content = await response.json();
    if (content.errorCode) {
      setErrorMessage(content.errorCode)
    } else {
      const updatedQuestions = questionsOverride.questions.filter(
        (question) => question.question !== content.question
      )
      
      setQuestionsOverride({ questions: updatedQuestions })
    }

    setLoading(false);
  }

  function Loading() {
    if(loading) {
      return <Space size="middle"> <Spin size="large" className="spinner" /> </Space>
    }
  }

  const frequentlyAskedQuestionsColumns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const questionOverrideColumns = [
    {
      title: 'Question',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: 'Answer',
      dataIndex: 'answer',
      key: 'answer',
    },
    {
      title: 'Action',
      key: 'id',
      personId: 'id',
      render: (_: any, record: { question: any; }) => (
        <>
          <DeleteOutlined
              onClick={() => {
                deleteOverrideQuestion(record.question);
              }}
              style={{ color: "red", marginLeft: 12 }}
          />
        </>
      ),
    },
  ];

  const dismissAlert = () => {
    setErrorMessage("");
};

  return (
    <div className="center-wrapper">
      <Typography.Title level={2}>{organization?.name} Dashboard</Typography.Title>
      <Loading/>
      <Card title="Frequently Asked Questions" bodyStyle={{padding: "0"}} style={{margin: "5%"}}>
        <Table dataSource={frequentQuestions?.questions} columns={frequentlyAskedQuestionsColumns} />
      </Card>

      <Card title="Question Override" bodyStyle={{padding: "0"}} style={{margin: "5%"}}>
        <h4 style={{fontStyle: "italic"}}>Overridden questions will always return the same response.</h4>
        <Form className="questionOverriddeForm" onFinish={addQuestionToOverride} >
          <Form.Item
              name={"question"}
              rules={[
                  {
                  required: true,
                  message: "Please enter valid question",
                  }
              ]}
          >                  
          <Input placeholder="Enter a question to override" />
          </Form.Item>

          <Form.Item
              name={"answer"}
              rules={[
                  {
                  required: true,
                  message: "Please enter valid answer",
                  }
              ]}
          >                  
          <Input placeholder="Enter the expected answer" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>Add</Button>
          {errorMessage !== "" && (
              <div className="erroralert">
              <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
              </div>
          )}
        </Form>

        <h2 style={{marginTop: "5%"}}>Overridden Questions</h2>
        <Table dataSource={questionsOverride?.questions} columns={questionOverrideColumns} />
      </Card>
    </div>
  );
}

export default Dashboard;