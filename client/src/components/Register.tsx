import React, { useState } from "react";
import { registerUser } from "../services/auth";

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await registerUser(email, password);
      console.log("User successfully registered: ", user);
    } catch (error) {
      console.log("Registration failed: ", error);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form
        className="bg-white shadow-md rounded-lg px-16 pt-8 pb-8 mb-4"
        onSubmit={handleRegistration}
      >
        <p className="text-6xl text-center pb-8">critik.io</p>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-8">
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
            className="appearance-none border-2 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center flex-col justify-between space-y-3">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
