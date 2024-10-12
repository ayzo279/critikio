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
    <div className="flex flex-col items-center justify-center min-h-screen">
      {isSigningUp ? (
        <Register />
      ) : (
        <Signin onSwitchToRegister={handleSwitchToSignup} />
      )}
      {isSigningUp && (
        <p>
          Already have an account?
          <button onClick={handleSwitchToSignin}>Sign In</button>
        </p>
      )}
    </div>
  );
};

export default SigninPage;
