import React, { useState, useEffect } from "react";
import SigninPage from "./pages/SigninPage";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<SigninPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
