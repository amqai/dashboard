import { useEffect } from "react";
import { useParams } from "react-router-dom";

function Dashboard() {
  const { projectId } = useParams();

  useEffect(() => {
    console.log(projectId);
  }, [projectId]);

  return (
    <div>Project ID: {projectId}</div>
  );
}

export default Dashboard;