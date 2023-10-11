import { Typography, Spin, Space, Table, Form, Button, Input} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";
import { OrganizationApiDto } from "../../models/Organization";
import { FrequentlyAskedQuestionsResponse } from "../../models/FrequentQuestions";
import { OverrideQuestionsResponse } from "../../models/QuestionOverride";

function Dashboard() {
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(null);
  const [frequentQuestions, setFrequentQuestions] = useState<FrequentlyAskedQuestionsResponse | null>(null);
  const [overrideQuestions, setOverrideQuestions] = useState<OverrideQuestionsResponse | null>(null)

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
          setOverrideQuestions(content)
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
    setOverrideQuestions(content)
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
  ];

  return (
    <div className="center-wrapper">
      <Typography.Title level={2}>{organization?.name} Dashboard</Typography.Title>
      <Loading/>
      <h3>Freuently Asked Questions</h3>
      <Table dataSource={frequentQuestions?.questions} columns={frequentlyAskedQuestionsColumns} />

      <h3>Add a question to override</h3>
      <Form className="questionOverriddeForm" onFinish={addQuestionToOverride}>
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
        {/* {errorMessage !== "" && (
            <div className="erroralert">
            <Alert message={errorMessage} onClose={dismissAlert} type="error" closable={true} />
            </div>
        )} */}
      </Form>

      <h3>Overridden Questions</h3>
      <Table dataSource={overrideQuestions?.overrideQuestions} columns={questionOverrideColumns} />
    </div>
  );
}

export default Dashboard;