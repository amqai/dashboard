import { Typography, Spin, Space, Table, Form, Button, Input, Alert } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";
import { OrganizationApiDto } from "../../models/Organization";
import { FrequentlyAskedQuestionsResponse } from "../../models/FrequentQuestions";
import { QuestionsOverrideResponse, QuestionOverrideResponse } from "../../models/QuestionOverride";

function Dashboard() {
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(null);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequentlyAskedQuestionsResponse | null>(null);
  const [questionsOverride, setQuestionsOverride] = useState<QuestionsOverrideResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('');

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
      // doesnt work 
      questionsOverride?.questions.push(content)
      setQuestionsOverride(questionsOverride);
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
      // Would prob be easier to conver this to a list
      // const updatedList = questionsOverride?.filter((question) => question.question == content.question)
      // setQuestionsOverride(updatedList)
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
      <div className="frequentlyAskedQuestions" style={{padding: "5%", background: "#B0C3D4", marginTop: "5%", marginBottom: "5%", borderRadius: "10px"}}>
      <h2>Frequently Asked Questions</h2>
        <Table dataSource={frequentQuestions?.questions} columns={frequentlyAskedQuestionsColumns} />
      </div>

      <div className="frequentlyAskedQuestions" style={{padding: "5%", background: "#B0C3D4", marginTop: "5%", marginBottom: "5%", borderRadius: "10px"}}>
        <h2>Add a question to override</h2>
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
      </div>
    </div>
  );
}

export default Dashboard;