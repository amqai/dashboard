import "./styles/dashboard.css"
import "./styles/header.css"
import { ConfigProvider, theme } from "antd";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Layout/AppRoutes"; // update with your actual path to AppRoutes

function App() {
  const primary = '#AF82F5' // purple
  const secondary = '#182125' // grey
  const accent1 = '#3C896D' // teal
  // const accent2 = '#D13610' // red

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorBgBase: secondary,
            // colorBgBase: '#2a0a2e',
            colorPrimary: primary,
            colorSuccessBg: accent1,
          },

          algorithm: theme.darkAlgorithm,
            components: {
              Layout: {
                colorBgHeader: "black",
              },
              Button: {
                colorPrimary: accent1,
                colorPrimaryHover: accent1,
              },
              Menu: {
                itemSelectedColor: primary,
                // itemSelectedBg: secondary,
              },
              Card: {
              }
            },
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
