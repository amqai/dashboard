import { Header } from "antd/es/layout/layout";
import logo from '../assets/logo.png';

function AppHeader() {
    return (
        <Header className="header">
            <div style={{display: "flex", alignItems: "center"}}>
            <img src={logo} width={80} style={{marginRight: 20, borderRadius: 15}}/>
            <div className="brand">AMQ AI</div>
            </div>
        </Header>
    );
}

export default AppHeader;