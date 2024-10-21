import React, { useState } from "react";
import ToggleButton from "./ToggleButton";
import MixResults from "./MixResults";

const TrackMixer: React.FC = () => {
  const [artists, setArtists] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [songLimit, setSongLimit] = useState<string>("5"); // State for the song limit
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleAddArtist = () => {
    if (searchInput && !artists.includes(searchInput)) {
      setArtists((prevArtists) => [...prevArtists, searchInput]);
      setSearchInput("");
    }
  };

  const handleRemoveArtist = (artist: string) => {
    setArtists((prevArtists) => prevArtists.filter((b) => b !== artist));
  };

  type ToggleKey =
    | "danceability"
    | "energy"
    | "tempo"
    | "valence"
    | "speechiness";

  const [toggles, setToggles] = useState<{
    [key in ToggleKey]: boolean;
  }>({
    danceability: false,
    energy: false,
    tempo: false,
    valence: false,
    speechiness: false,
  });

  const toggleFeatures: { key: ToggleKey; label: string }[] = [
    { key: "danceability", label: "Danceability" },
    { key: "energy", label: "Energy" },
    { key: "tempo", label: "Tempo" },
    { key: "valence", label: "Emotions" },
    { key: "speechiness", label: "Vocal presence" },
  ];

  const handleToggle = (feature: ToggleKey) => {
    setToggles((prevToggles) => ({
      ...prevToggles,
      [feature]: !prevToggles[feature], // Toggle the specific feature
    }));
  };

  const handleSongLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSongLimit(e.target.value);
  };

  const handleBuildClick = () => {
    if (artists.length === 0) {
      alert("Please add at least one artist.");
      return;
    }
    console.log(artists, toggles, songLimit)
    setShowResults(true);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-4 w-full">
          <p className="text-4xl font-extralight text-slate-800 pb-4">
            Build your mix
          </p>
          <div className="flex flex-row items-center justify-center space-x-4 w-2/3">
            <div className="flex flex-row w-2/3">
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchInputChange}
                className="border border-gray-400 p-2 rounded w-3/5"
                placeholder="Target artist"
              />
              <button
                onClick={handleAddArtist}
                className="bg-green-500 text-white px-4 py-2 rounded ml-2 w-2/5"
              >
                Add artist
              </button>
            </div>
            <div className="flex flex-row items-center justify-center w-1/3">
              <label htmlFor="songLimit" className="mr-2 text-slate-700">
                Songs per Artist:
              </label>
              <select
                id="songLimit"
                value={songLimit}
                onChange={handleSongLimitChange}
                className="border border-gray-400 px-4 py-2 rounded"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="All">all</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {artists.map((artist, index) => (
              <span
                key={index}
                className="bg-emerald-700 text-white px-4 py-1 rounded-full flex items-center"
              >
                {artist}
                <button
                  className="ml-2"
                  onClick={() => handleRemoveArtist(artist)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-row space-x-8">
            {toggleFeatures.map(({ key, label }) => (
              <ToggleButton
                key={key}
                text={label}
                initialState={toggles[key]}
                onToggle={() => handleToggle(key)}
                color="indigo"
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleBuildClick}
          className="bg-blue-700 text-white px-4 py-2 rounded-full w-2/5"
        >
          <p className="font-semibold text-2xl p-2">BUILD</p>
        </button>
      </div>
      {showResults && (
        <div className="flex flex-col items-start mx-32 my-12">
          <MixResults
            artists={artists}
            toggles={toggles}
            samplingSize={songLimit}
          />
        </div>
      )}
    </div>
  );
};

export default TrackMixer;
