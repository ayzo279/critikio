import React, { useState } from "react";
import { signinUser } from "../services/auth";

interface SigninProps {
  onSwitchToRegister: () => void; // Prop to switch to Register component
}

const Signin: React.FC<SigninProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>(""); // State to hold error messages

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation check for empty fields
    if (!email || !password) {
      setErrorMessage("Please fill in both fields.");
      return;
    } else {
      setErrorMessage("");
    }

    try {
      const user = await signinUser(email, password);
      console.log("User successfully logged in:", user);
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Incorrect email/password. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-xs">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={handleSignin}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {errorMessage && (
          <p className="text-red-500 text-xs italic">{errorMessage}</p>
        )}{" "}
        {/* Display error message */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign In
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="#"
          >
            Forgot Password?
          </a>
        </div>
      </form>
      <p className="text-center text-gray-500 text-xs">
        New user?{" "}
        <button
          className="text-blue-500 hover:text-blue-800"
          onClick={onSwitchToRegister}
        >
          Create account
        </button>
      </p>
    </div>
  );
};

export default Signin;
