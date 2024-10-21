import React from "react";
import Navbar from "../components/Navbar";
import MusicSearch from "../components/MusicSearch";
import TrackMixer from "../components/TrackMixer";

import { TabProvider } from "../contexts/TabContext";
import useTab from "../contexts/useTab";


const HomePage: React.FC = () => {
  return (
    <TabProvider>
      <div className="flex h-screen p-10">
        <Navbar />
        <ActiveTabContent/>
      </div>
    </TabProvider>
  );
};

const ActiveTabContent: React.FC = () => {
  const { activeTab } = useTab();

  return (
    <div className="ml-64 flex-grow h-full">
      {activeTab === "home" && <MusicSearch />}
      {activeTab === "trackmixer" && <TrackMixer />}
    </div>
  );
};

export default HomePage;
