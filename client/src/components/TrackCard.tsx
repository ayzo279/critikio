import React, { useState } from "react";

interface TrackCardProps {
  trackTitle: string;
  artistName: string;
  imageURL: string;
  similarityScore: number[];
  trackID: string;
  onClick: () => void;
  toggles: { [key: string]: boolean };
  featureColors: { [key: string] : string};
}

const TrackCard: React.FC<TrackCardProps> = ({
  trackTitle,
  artistName,
  imageURL,
  similarityScore,
  trackID,
  onClick,
  toggles,
  featureColors
}) => {
  const formatScore = (score: number): string => {
    const percentage = (score * 100).toFixed(1);
    return `${percentage}`;
  };

  const [flipped, setFlipped] = useState(false);

  const handleCardClick = () => {
    setFlipped(!flipped);
    onClick();
  };

  const toggleLabels: {[key: string]:string} = {
    "danceability": "Danceability",
    "energy": "Energy",
    "tempo":"Tempo",
    "valence":"Emotions",
    "speechiness": "Vocal presence",
  };

  const trueToggles = Object.entries(toggles)
  .filter(([_, value]) => value === true) // Filter for true values
  .map(([key]) => key);


  return (
    <button
      className="track w-72 h-1/2 bg-white border border-gray-500 rounded-lg shadow dark:bg-gray-800 dark:border-gray-70"
      data-spotify-id={trackID}
      onClick={handleCardClick}
    >
      <div className="w-full h-48 overflow-hidden">
        <img
          src={imageURL}
          alt="Album cover of {trackTitle}"
          className="w-full h-full object-cover object-center"
        />
      </div>
      {flipped ? (
        <div className="h-64 py-6 px-8 flex flex-col space-y-4 text-gray-900 dark:text-white">
          {similarityScore.slice(1).map((_, index) => (
          <div className="flex flex-row space-x-4 items-start">
            <div className="w-24 text-left -mt-1">
              <p className="text-xs">{toggleLabels[trueToggles[index]]}</p>
            </div>
            <div className="w-full flex flex-col items-center space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className={`${featureColors[trueToggles[index]]} h-2.5 rounded-full`} style={{ width: `${Math.floor(similarityScore[index] * 100)}%` }}
              ></div>
              </div>
              <div>
              <p className="tracking-tight text-xs">{formatScore(similarityScore[index])}%</p>
              </div>
            </div>
          </div>
          ))}
        </div>
      ) : (
        <div className="h-64 p-8 flex flex-col space-y-4 text-gray-900 dark:text-white">
          <div className="flex-down space-y-1 min-h-24">
            <p className="text-2xl font-semibold tracking-tight line-clamp-2">
              {trackTitle}
            </p>
            <p className="text-md font-normal text-gray-700 dark:text-gray-400">
              {artistName}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="inline-flex items-end space-x-0.5">
              <p className="text-4xl font-semibold">
                {formatScore(similarityScore[0])}
              </p>
              <p className="pb-1 text-md">%</p>
            </span>
            <p className="text-sm font-extralight">Similarity</p>
          </div>
        </div>
      )}
    </button>
  );
};

export default TrackCard;
