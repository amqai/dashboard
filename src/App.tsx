import "./styles/dashboard.css"
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from 'antd';
import AppRoutes from "./Layout/AppRoutes"; // update with your actual path to AppRoutes

function App() {
  const primary = '#AF82F5' // purple
  const secondary = '#253237' // grey
  const accent1 = '#3C896D' // teal
  // const accent2 = '#D13610' // red

  return (
    <>
      {/* <ConfigProvider
        theme={{
          token: {
            // change colors of antd here
          },

          algorithm: theme.darkAlgorithm,
            components: {
              Layout: {
                colorBgHeader: "black",
                colorBgBody: primary,
              },

              Button: {
                colorPrimary: accent1,
                colorPrimaryHover: accent1,
              },
              Menu: {
                itemSelectedColor: primary,
                // itemSelectedBg: secondary,
              }
            },
        }}
      > */}

        <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      {/* </ConfigProvider> */}


    </>

    
  );
}

export default App;
