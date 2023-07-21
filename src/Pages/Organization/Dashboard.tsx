import { useParams } from "react-router-dom";

function Dashboard() {
  const { organizationId } = useParams();

  return (
    <div>Organization ID: {organizationId}</div>
  );
}

export default Dashboard;