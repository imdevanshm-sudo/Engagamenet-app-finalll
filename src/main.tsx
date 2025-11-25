
import { AppProvider } from "./AppContext";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import App from "./App";

const MainApp = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default MainApp;
