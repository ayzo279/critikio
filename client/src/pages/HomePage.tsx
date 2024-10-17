import React from "react";
import Navbar from "../components/Navbar";
import TrackCard from "../components/TrackCard";
import MusicSearch from "../components/MusicSearch";
// import ToggleButton from "../components/ToggleButton";
import { TabProvider } from "../contexts/TabContext";

const HomePage: React.FC = () => {
  return (
    <TabProvider>
      <div className="flex h-screen p-10">
        <Navbar />
        <div className="ml-64 flex-grow h-full">
          <MusicSearch />
        </div>
        {/* <ToggleButton text="Danceability" /> */}
        {/* <TrackCard trackTitle="Shape of You in the Stars (From the Vault) (Taylor's Version)" artistName="Ed Sheeran" imageURL="https://i.scdn.co/image/ab67616d0000b27383e9b06ccd219248b5301264" similarityScore={0.5}/> */}
      </div>
    </TabProvider>
  );
};

export default HomePage;
