import "./styles/dashboard.css";
import "./styles/header.css";
import { ConfigProvider, theme } from "antd";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Layout/AppRoutes"; // update with your actual path to AppRoutes

function App() {

  const primary = "#203846"; // lightblue
  const secondary = "#09203e"; // dark blue
  const accent = "#E94F37"; // orange

  //"#AF82F5"; // purple
  //"#182125"; // grey
  //"#3C896D"; // teal

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorBgBase: primary,
            colorPrimary: secondary,
            colorSuccessBg: secondary,
          },

          algorithm: theme.darkAlgorithm,
          components: {
            Button: {
              colorPrimary: accent,
              colorPrimaryHover: accent,
            },
            Menu: {
              itemSelectedColor: accent,
              // itemBg: primary,
              itemSelectedBg: secondary
            },
            Tabs: {
              itemSelectedColor: accent,
              itemHoverColor: accent,
              inkBarColor: accent,
            },
            Modal: {
              colorBgContainer: primary,
            },
            Card: {},
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
