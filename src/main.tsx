import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'antd/dist/reset.css'
import { ConfigProvider } from 'antd'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider theme={{
      token: {
        colorPrimary: "#2123bf",
      }
    }}>
      <App />
    </ConfigProvider>
)
