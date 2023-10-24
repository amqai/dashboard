import { Header } from "antd/es/layout/layout";
import { useNavigate } from 'react-router-dom';

function AppHeader() {
    const navigate = useNavigate();

    const navigateHome = () => {
        navigate(`/`);
      }

    return (
        <Header className="header">
            <div>
                <div className="brand" onClick={navigateHome}/>
            </div>
        </Header>
    );
}

export default AppHeader;