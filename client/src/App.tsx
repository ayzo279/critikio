import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import SigninPage from "./pages/SigninPage";
import HomePage from "./pages/HomePage";
import { getUserToken } from "./services/auth";

const App: React.FC = () => {
  return (
    <Router>
      <AuthCheck />
    </Router>
  );
};

const AuthCheck: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const token = await getUserToken();
        if (token) {
          setIsAuthenticated(true);
          navigate("/home");
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking user authentication:", error);
      }
    };

    checkUserAuth();
  }, [navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <HomePage /> : <SigninPage />}
      />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  );
};

export default App;
