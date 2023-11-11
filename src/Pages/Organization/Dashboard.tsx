import { Typography, Spin, Space, Table, Card, Drawer, Descriptions, Progress, Divider} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";
import { OrganizationApiDto } from "../../models/Organization";
import { FrequentlyAskedQuestionPromptsResponse, FrequentlyAskedQuestionsResponse } from "../../models/FrequentQuestions";

function Dashboard() {
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(
    null
  );
  const [frequentQuestions, setFrequentQuestions] =
    useState<FrequentlyAskedQuestionsResponse | null>(null);

  const [frequentQuestionPrompts, setFrequentQuestionPrompts] =
    useState<FrequentlyAskedQuestionPromptsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptDetailsLoading, setPromptDetailsLoading] = useState(false);
  const [promptDetailsVisible, setPromptDetailsVisible] = useState(false);

  // Get organization
  useEffect(() => {
    (async () => {
      if (organizationId) {
        setLoading(true);
        const jwt = localStorage.getItem("jwt");
        const response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/api/organization?organizationId=${organizationId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        const content = await response.json();
        setOrganization(content);
        setLoading(false);
      }
    })();
  }, [organizationId]);

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
          <a onClick={() => handleOpenPromptDetailsDrawer(mfaqId)}>View Related Questions</a>
        </>
        );
      },
    },
  ];

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

  return (
    <div className="center-wrapper">
      <Typography.Title level={2}>
        {organization?.name} Dashboard
      </Typography.Title>
      <Loading />
      <Card title="Frequently Asked Questions" style={{ marginBottom: "5%" }}>
        <Table
          dataSource={frequentQuestions?.questions}
          columns={frequentlyAskedQuestionsColumns}
        ></Table>
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
            <h2 style={{color: "white"}}> Questions contributing to the Frequently Asked Questions result</h2>
            {/* check admin here  */}
            {/* <h3>Adjust the similarity tolerance <a>here</a></h3> */}
            <Divider/>
            {frequentQuestionPrompts.prompts.map((prompt) => (
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
    </div>
  );
}

export default Dashboard;
