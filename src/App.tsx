import "./styles/dashboard.css"
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme } from 'antd';
import AppRoutes from "./Layout/AppRoutes"; // update with your actual path to AppRoutes

function App() {
  const primary = '#AF82F5' // purple
  const secondary = '#253237' // grey
  const tertiary = '#253237' // light
  const accent1 = '#3C896D' // teal
  const accent2 = '#D13610' // red

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
                colorPrimary: accent1,
                colorPrimaryHover: accent1,
              },
              Menu: {
                itemSelectedColor: primary,
                // itemSelectedBg: secondary,
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
