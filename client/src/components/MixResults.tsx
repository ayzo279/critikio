import React, { useState, useEffect } from "react";
import axios from "axios";
import SpotifyEmbed from "./SpotifyEmbed";

interface SearchProps {
  artists: string[];
  toggles: { [key: string]: boolean };
  samplingSize: string;
}

const MixResults: React.FC<SearchProps> = ({
  artists,
  toggles,
  samplingSize,
}) => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const [currentTrackUri, setCurrentTrackUri] = useState<string | null>(null);

  const handleTrackClick = (uri: string) => {
    setCurrentTrackUri(uri); // Set the new track URI
    console.log("Clicked track URI:", uri); // Log to confirm the track URI
  };

  useEffect(() => {
    const fetchResults = async () => {
      const requestData = {
        artists,
        toggles,
        samplingSize,
      };

      try {
        const response = await axios.post(
          "https://harmonalyze.onrender.com/clustering/",
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data; // Use response.data directly
        setClusters(data.clusters);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        console.log("Clusters successfully retrieved.");
        setLoading(false);
      }
    };
    fetchResults();
  }, [artists, toggles, samplingSize]);

  useEffect(() => {
    console.log(clusters);
  }, [clusters]);

  return (
    <div className="flex justify-center w-full px-4">
      <div className="w-full max-w-4xl">
        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div className="content-center space-y-6">
            {clusters.length > 0 ? (
              clusters.map((cluster, clusterIndex) => (
                <div key={clusterIndex} className="mb-6">
                  <p className="text-2xl font-bold mb-2">{`Mix ${clusterIndex + 1}`}</p>
                  <ul className="w-full space-y-2">
                    {cluster.map((song, songIndex) => (
                      <li key={songIndex} className="w-full">
                        <div
                          className="flex justify-between items-center w-full p-2 border-b border-gray-300" 
                          // "cursor-pointer hover:bg-gray-100"
                          // onClick={() => handleTrackClick(song[0])}
                        >
                          <p className="flex-1 font-medium text-gray-800">{song[1]}</p>
                          <p className="text-gray-600">{song[2]}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {currentTrackUri && (
                    <div className="sticky bottom-0 w-full mx-auto">
                      <SpotifyEmbed id={currentTrackUri} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">The songs could not be retrieved.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MixResults;
