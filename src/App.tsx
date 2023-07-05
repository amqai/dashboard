import "./styles/dashboard.css"
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Layout/AppRoutes"; // update with your actual path to AppRoutes

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
