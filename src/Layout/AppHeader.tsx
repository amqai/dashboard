import { Header } from "antd/es/layout/layout";
import { useNavigate } from 'react-router-dom';

function AppHeader() {
    const navigate = useNavigate();

    const navigateHome = () => {
        navigate(`/`);
      }

    return (
        <Header className="header" style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                <div className="brand" onClick={navigateHome}>AmQai</div>
            </div>
        </Header>
    );
}

export default AppHeader;