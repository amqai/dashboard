import "./styles/dashboard.css"
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from 'antd';
import AppRoutes from "./Layout/AppRoutes"; // update with your actual path to AppRoutes

function App() {
  return (
    <>
      <ConfigProvider
        theme={{

          token: {
            colorPrimary: 'grey',
          },

          algorithm: theme.darkAlgorithm,
            components: {
              Button: {
                // colorPrimary: '#00b96b',
                // colorPrimaryHover: 'orange',
              },
              Menu: {
                //todo: Do better with colors here
                itemSelectedColor: 'purple',
                itemSelectedBg: 'grey',
              }
            },

          // Combine dark algorithm and compact algorithm
          // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        }}
      >

        <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      </ConfigProvider>


    </>

    
  );
}

export default App;
