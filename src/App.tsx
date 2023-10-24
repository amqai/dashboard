import "./styles/dashboard.css"
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Layout/AppRoutes"; // update with your actual path to AppRoutes

function App() {
  // const primary = '#AF82F5' // purple
  // const secondary = '#182125' // grey
  // const accent1 = '#3C896D' // teal
  // const accent2 = '#D13610' // red

  return (
    <>
      {/* <ConfigProvider
        theme={{
          token: {
            colorBgBase: secondary,
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
