import React from "react";
import { HomeIcon, MusicalNoteIcon } from "@heroicons/react/24/solid";
import { useLocation, Link } from "react-router-dom";
import { signoutUser } from "../services/auth";
import useTab from "../contexts/useTab";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { activeTab, setActiveTab } = useTab();

  const handleSignOut = async () => {
    try {
      await signoutUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="h-screen w-64 fixed top-0 left-0 bg-slate-800 shadow-md">
      <div className="flex-col flex items-center justify-center">
        <div className="text-white text-2xl font-bold p-8">harmonalyze</div>
        <nav className="mt-10 w-full text-md text-white font-light">
          <ul className="space-y-4 px-1">
            <li>
              <Link
                to="/home"
                onClick={() => setActiveTab("home")}
                className={`flex space-x-4 py-3 pl-8 rounded-xl ${
                  activeTab === "home" ? "bg-blue-700" : ""
                }`}
              >
                <HomeIcon className="h-6 w-6 text-white" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/home"
                onClick={() => setActiveTab("trackmixer")}
                className={`flex space-x-4 py-3 pl-8 rounded-xl ${
                  activeTab === "trackmixer" ? "bg-blue-700" : ""
                }`}
              >
                <MusicalNoteIcon className="h-6 w-6 text-white" />
                <span>Track Mixer</span>
              </Link>
            </li>
          </ul>
        </nav>
        <button
          onClick={handleSignOut}
          className="fixed bottom-10 text-white text-md"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
