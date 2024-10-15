import React from "react";

interface TrackCardProps {
  trackTitle: string;
  artistName: string;
  imageURL: string;
  similarityScore: number;
}

const TrackCard: React.FC<TrackCardProps> = ({
  trackTitle,
  artistName,
  imageURL,
  similarityScore,
}) => {
  const formatScore = (score: number): string => {
    const percentage = (score * 100).toFixed(1);
    return `${percentage}`;
  };

  return (
    <div className="w-72 h-96 bg-white border border-gray-500 rounded-lg shadow dark:bg-gray-800 dark:border-gray-70">
      <div className="w-full h-48 overflow-hidden">
        <img
          src={imageURL}
          alt="Album cover of {trackTitle}"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="p-8 flex flex-col space-y-4 text-gray-900 dark:text-white">
        <div className="flex-down space-y-1">
          <p className="text-2xl font-semibold tracking-tight">{trackTitle}</p>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {artistName}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <span className="inline-flex items-end space-x-0.5">
            <p className="text-4xl">{formatScore(similarityScore)}</p>
            <p className="pb-1 text-md">%</p>
          </span>
          <p className="text-sm font-extralight">Similarity</p>
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
