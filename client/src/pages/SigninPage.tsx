import React, { useState } from "react";
import Signin from "../components/Signin";
import Register from "../components/Register";

const SigninPage: React.FC = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSwitchToSignup = () => {
    setIsSigningUp(true);
  };

  const handleSwitchToSignin = () => {
    setIsSigningUp(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      {isSigningUp ? (
        <Register />
      ) : (
        <Signin onSwitchToRegister={handleSwitchToSignup} />
      )}
      {isSigningUp && (
        <p className="text-center text-gray-500 text-xs">
          Already have an account? 
          <button className="text-blue-500 hover:text-blue-800 ml-1" onClick={handleSwitchToSignin}>Sign In</button>
        </p>
      )}
    </div>
  );
};

export default SigninPage;
