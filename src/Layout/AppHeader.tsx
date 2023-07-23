import { Header } from "antd/es/layout/layout";

function AppHeader() {
    return (
        <Header className="header" style={{display: "flex", justifyContent: "space-between"}}>
            <div>
                <div className="brand">AMQai</div>
            </div>
        </Header>
    );
}

export default AppHeader;