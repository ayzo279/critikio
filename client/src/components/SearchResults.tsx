// MusicResults.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import TrackCard from "./TrackCard";

interface SearchProps {
  referenceTrack: string;
  referenceArtist: string;
  toggles: { [key: string]: boolean };
  badges: string[];
}

const SearchResults: React.FC<SearchProps> = ({
  referenceTrack,
  referenceArtist,
  toggles,
  badges,
}) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[][]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      const requestData = {
        referenceTrack,
        referenceArtist,
        toggles,
        badges,
      };

      try {
        const response = await axios.post(
          "https://harmonalyze.onrender.com/recommendation/",
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data; // Use response.data directly
        if (data.recommended_songs && Array.isArray(data.recommended_songs)) {
          const songList: any[][] = [];

          // Use a for loop to iterate through recommended_songs
          for (let i = 0; i < data.recommended_songs.length; i++) {
            const song = data.recommended_songs[i];
            songList.push([song[0], song[1], song[2], song[3]]);
          }

          // Update the state with the list of lists
          setRecommendations(songList);
        }
        // setResults(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [referenceTrack, referenceArtist, toggles, badges]);

  useEffect(() => {
    console.log("Results updated:", recommendations);
  }, [recommendations]);

  if (loading && results.length === 0) {
    return <div className="flex flex-col text-4xl items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center">
    <p className="text-2xl">
    Here are some songs similar to
    </p>
    <div className="flex flex-col items-center p-4">
    <p className="text-4xl font-semibold">
      {referenceTrack}
    </p>
    <p className="text-md">
      {referenceArtist.toUpperCase()}
    </p>
    </div>
    <div className="flex flex-row space-x-2">
    {Object.entries(toggles)
        .filter(([key, value]) => value === true) // Filter out only true values
        .map(([key]) => (
          <div
            key={key} // Use the key as the unique identifier
            className="px-4 py-2 bg-blue-700 text-white rounded-full"
          >
            {key}
          </div>
        ))}
        </div>
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {recommendations.length > 0 ? (
        recommendations.map((song, index) => (
          <TrackCard
            key={index} // Use song id as the unique key
            trackTitle={song[0]} // Track title
            artistName={song[1]} // Artist name
            imageURL={song[3]} // Image URL
            similarityScore={song[2]} // Similarity score
          />
        ))
      ) : (
        <div>No recommended songs available</div>
      )}
    </div>
    </div>
  );
};

export default SearchResults;