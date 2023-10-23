import { Button, Card, Form, Input, Space, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { QuestionsOverrideResponse } from '../models/QuestionOverride';
import { DeleteOutlined } from "@ant-design/icons";
import { BiSolidHelpCircle } from "react-icons/bi";
import { Alert as AlertModel, AlertType } from "../models/Alert";

interface QuestionOverrideFormProps {
    organizationId: string | undefined;
    setAlertMessage: React.Dispatch<React.SetStateAction<AlertModel | null>>;
}
  
const QuestionOverrideForm: React.FC<QuestionOverrideFormProps> = ({ organizationId, setAlertMessage }) => {

    const [loading, setLoading] = useState(false);
    const [questionsOverride, setQuestionsOverride] = useState<QuestionsOverrideResponse>({
        questions: [],
    });

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
            setAlertMessage({
                message: content.errorMessage,
                type: AlertType.Error,
            })
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
            setAlertMessage({
                message: content.errorMessage,
                type: AlertType.Error,
            })
        } else {
            const updatedQuestions = questionsOverride.questions.filter((question) => question.question !== content.question)
            setQuestionsOverride({ questions: updatedQuestions })
        }

        setLoading(false);
    }

    function Loading() {
        if(loading) {
          return <Space size="middle"> <Spin size="large" className="spinner" /> </Space>
        }
    }

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

    return (
        <Card 
            title={
                <span>Question override <BiSolidHelpCircle title="Overridden questions will always return the same response" /></span>
            }
        >
            <Loading/>
            <h4 style={{fontStyle: "italic"}}></h4>
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
            </Form>

            <h2 style={{marginTop: "5%"}}>Overridden Questions</h2>
            <Table dataSource={questionsOverride?.questions} columns={questionOverrideColumns} />
        </Card>
    );
};

export default QuestionOverrideForm;
