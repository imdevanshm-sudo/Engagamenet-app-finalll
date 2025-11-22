import { AppProvider } from "./AppContext";
import { AuthProvider } from "./AuthContext";
import App from "./App";

const MainApp = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  );
};

export default MainApp;
