import { useEffect, useState } from "react";
import { Table, Card, Alert } from "antd";
import { Alert as AlertModel } from "../../models/Alert";
import "../../styles/common.css";
import { useNavigate, useParams } from "react-router-dom";
import { SubscriptionDto } from "../../models/Subscriptions";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>();
  const [alertMessage, setAlertMessage] = useState<AlertModel | null>(null);
  const { organizationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const jwt = localStorage.getItem("jwt");
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/subscription?organizationId=${organizationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const content = await response.json();
      if (content != null && content.subscriptions != null) {
        setSubscriptions(...[content.subscriptions]);
      }
    })();
  }, []);

  const goToStripeSubscription = (stripeSubscriptionId: string) => {
    const stripeUrl = `${import.meta.env.VITE_APP_STRIPE_URL}/subscriptions/${stripeSubscriptionId}`;
    window.open(stripeUrl, '_blank');
  }

  const goToAdminOrganizations = () => {
    navigate("/admin/organizations");
  }

  const subscriptionColumns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Stripe Id",
      key: "stripeSubscriptionId",
      render: (_: any, record: SubscriptionDto) => (
       <>
       {record.stripeSubscriptionId !== null ? (
        <a onClick={() => goToStripeSubscription(record.stripeSubscriptionId)}>{record.stripeSubscriptionId}</a>
       ) : (
        <>Not Stripe Subscription</>
       )}
       </> 
      )
    },
    {
      title: "Prompt Limit",
      dataIndex: "promptLimit",
      key: "promptLimit",
    },
    {
      title: "Embedding Limit",
      dataIndex: "embeddingLimit",
      key: "embeddingLimit"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status"
    },
    {
      title: "Period Start",
      key: "periodStart",
      render: (_: any, record: SubscriptionDto) => (
        <>{new Date(record.periodStart).toLocaleDateString()}</>
      )
    },
    {
      title: "Period End",
      key: "periodEnd",
      render: (_: any, record: SubscriptionDto) => (
        <>{new Date(record.periodEnd).toLocaleDateString()}</>
      )
    }
  ];

  const dismissAlert = () => {
    setAlertMessage(null);
  };

  return (
    <div className="center-wrapper">
      <div style={{marginBottom: "15px"}}>
        <a onClick={() => goToAdminOrganizations()}>&lt; Organizations</a>
      </div>
      <Card title={`Manage ${organizationId} subscriptions`} bodyStyle={{ overflowX: "auto" }}>
        {alertMessage !== null && alertMessage.message !== "" && (
          <div style={{ margin: "24px" }}>
            <Alert
              message={alertMessage.message}
              onClose={dismissAlert}
              type={alertMessage.type}
              closable={true}
            />
          </div>
        )}
        <Table dataSource={subscriptions} columns={subscriptionColumns} />
      </Card>
    </div>
  );
}

export default Subscriptions;
