import { Typography, Spin, Space } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/common.css";
import { OrganizationApiDto } from "../../models/Organization";
import FrequentlyAskedQuestions from "../../Components/FAQ"

function Dashboard() {
  const { organizationId } = useParams();
  const [organization, setOrganization] = useState<OrganizationApiDto | null>(
    null
  );
  const [loading, setLoading] = useState(false);

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
    <div className="center-wrapper">
      <Typography.Title level={2}>
        {organization?.name} Dashboard
      </Typography.Title>
      <Loading />
      <FrequentlyAskedQuestions organizationId={organizationId} />
    </div>
  )
}

export default Dashboard
