import React, { useState } from "react";
import ToggleButton from "./ToggleButton";
import SearchResults from "./SearchResults";

const MusicSearch: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [badges, setBadges] = useState<string[]>([]);
  const [referenceTrack, setReferenceTrack] = useState("");
  const [referenceArtist, setReferenceArtist] = useState("");
  const [showResults, setShowResults] = useState(false); // State to track visibility of results

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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleAddBadge = () => {
    if (searchInput && !badges.includes(searchInput)) {
      setBadges([...badges, searchInput]);
      setSearchInput("");
    }
  };

  const handleRemoveBadge = (badge: string) => {
    setBadges(badges.filter((b) => b !== badge));
  };

  const handleTrackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceTrack(e.target.value);
  };

  const handleArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceArtist(e.target.value);
  };

  const handleToggle = (feature: ToggleKey) => {
    setToggles((prevToggles) => ({
      ...prevToggles,
      [feature]: !prevToggles[feature], // Toggle the specific feature
    }));
  };

  const handleSearchClick = () => {
    setShowResults(true); // Show results when search button is clicked
  };

  const toggleFeatures: { key: ToggleKey; label: string }[] = [
    { key: "danceability", label: "Danceability" },
    { key: "energy", label: "Energy" },
    { key: "tempo", label: "Tempo" },
    { key: "valence", label: "Emotions" },
    { key: "speechiness", label: "Vocal presence" },
  ];

  return (
    <div>
      {showResults ? (
        <SearchResults
          referenceTrack={referenceTrack}
          referenceArtist={referenceArtist}
          toggles={toggles}
          badges={badges}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full p-6">
          <div className="flex flex-col items-center space-y-2 pb-24">
            <p className="text-6xl font-extralight text-slate-800">
              Looking to curate a vibe?
            </p>
            <p className="text-xl font-bold text-slate-400">
              Discover similar music from artists you love
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 mb-24">
            <p className="text-2xl font-extralight">REFERENCE TRACK</p>
            <div className="flex flex-row items-center justify-center space-x-4 w-full">
              <input
                type="text"
                value={referenceTrack}
                onChange={handleTrackChange}
                className="border border-gray-400 p-2 rounded w-96"
                placeholder="Song"
              />
              <p>BY</p>
              <input
                type="text"
                value={referenceArtist}
                onChange={handleArtistChange}
                className="border border-gray-400 p-2 rounded w-48"
                placeholder="Artist"
              />
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 pb-8">
            <p className="text-lg italic">
              I am looking for songs that are similar based on...
            </p>
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
          <div className="flex flex-col items-center space-y-4 pb-20 w-full">
            <p className="text-lg italic">I want songs from these artists</p>
            <div className="flex flex-row items-center justify-center w-full">
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchInputChange}
                className="border border-gray-400 p-2 rounded w-1/5"
                placeholder="Target artist"
              />
              <button
                onClick={handleAddBadge}
                className="bg-green-500 text-white px-4 py-2 rounded ml-2"
              >
                Add artist
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className="bg-emerald-700 text-white px-4 py-1 rounded-full flex items-center"
                >
                  {badge}
                  <button
                    className="ml-2"
                    onClick={() => handleRemoveBadge(badge)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleSearchClick}
            className="bg-blue-700 text-white px-4 py-2 rounded-full w-2/5"
          >
            <p className="font-semibold text-2xl p-2">SEARCH</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicSearch;
