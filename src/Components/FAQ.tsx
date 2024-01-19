import { useEffect, useState } from "react";
import { Spin, Drawer, Descriptions, Progress, Divider, Space, Card, Table} from "antd";
import { FrequentlyAskedQuestionPromptsResponse, FrequentlyAskedQuestionsResponse } from "../models/FrequentQuestions";

interface OrganizationDetails {
    organizationId: string | undefined;
}

const FrequentlyAskedQuestions: React.FC<OrganizationDetails> = ({ organizationId }) => {
    const [frequentQuestions, setFrequentQuestions] =
        useState<FrequentlyAskedQuestionsResponse | null>(null);
    const [frequentQuestionPrompts, setFrequentQuestionPrompts] =
        useState<FrequentlyAskedQuestionPromptsResponse | null>(null);
    const [promptDetailsLoading, setPromptDetailsLoading] = useState(false);
    const [promptDetailsVisible, setPromptDetailsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
          if (organizationId) {
            setLoading(true);
            const jwt = localStorage.getItem("jwt");
            const response = await fetch(
              `${
                import.meta.env.VITE_APP_API_URL
              }/api/organization/frequent-questions?organizationId=${organizationId}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );
    
            const content = await response.json();
            setFrequentQuestions(content);
            setLoading(false);
          }
        })();
      }, [organizationId]);

    const handleCloseFaqPromptsDrawer = () => {
        setPromptDetailsVisible(false)
      }
    
    const handleOpenPromptDetailsDrawer = async(mfaqId: string) => {
        setPromptDetailsVisible(true)
        setPromptDetailsLoading(true);
    
        const jwt = localStorage.getItem("jwt");
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/organization/frequent-questions/prompts?mfaqId=${mfaqId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
    
        const content = await response.json();
        setFrequentQuestionPrompts(content)
        setPromptDetailsLoading(false);
    }


    const frequentlyAskedQuestionsColumns = [
        {
          title: "Question",
          dataIndex: "question",
          key: "question",
        },
        {
          title: "Count",
          dataIndex: "count",
          key: "count",
        },
        {
          title: "Related Questions",
          dataIndex: "mfaqId",
          key: "mfaqId",
          render: (mfaqId: string) => {
            return (
            <>
              <a onClick={() => handleOpenPromptDetailsDrawer(mfaqId)}
              style={{ textDecoration: "none" }}
              >View Related Questions</a>
            </>
            );
          },
        },
    ];

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

    return (
        <>
            <Loading />
            <Card title="Frequently Asked Questions" style={{ marginBottom: "5%" }}>
            <Table
            dataSource={frequentQuestions?.questions}
            columns={frequentlyAskedQuestionsColumns}
            />
            </Card>

            {frequentQuestionPrompts && (
                <Drawer
                    open={promptDetailsVisible}
                    onClose={handleCloseFaqPromptsDrawer}
                    size="large"
                >
                {promptDetailsLoading ? (
                    <Spin size="large" />
                ) : (
                    <ul>
                        <h2 style={{color: "white"}}>Related Questions</h2>
                        {/* check admin here  */}
                        {/* <h3>Adjust the similarity tolerance <a>here</a></h3> */}
                        <Divider/>
                
                        {frequentQuestionPrompts.prompts
                        .filter((prompt) => prompt.score !== 1)
                        .map((prompt) => (
                            <Descriptions >
                                <Descriptions.Item style={{width:"60%"}}label="Question">
                                {prompt.question}
                                </Descriptions.Item>
                                <Descriptions.Item label="Similarity Score">
                                    <Progress
                                        type="circle"
                                        percent={prompt.score}
                                        size="small"
                                    />
                                </Descriptions.Item>
                            </Descriptions>
                        ))}
                    </ul>
                    )}
                </Drawer>
            )}
        </>  
    )
}

export default FrequentlyAskedQuestions;