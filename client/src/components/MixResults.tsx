import React, { useState, useEffect } from "react";
import axios from "axios";

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
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? ( 
        <div>
          <p>Error: {error}</p>
        </div>
      ) : (
        <div>
          {clusters.length > 0 ? (
            clusters.map((cluster, clusterIndex) => (
                <div>
                <p className="text-xl font-bold">{`Mix ${clusterIndex + 1}`}</p>
              <ul key={clusterIndex}>
                {cluster.map((song, songIndex) => (
                  <li className="text-lg" key={songIndex}>{song}</li>
                ))}
              </ul>
              </div>
            ))
          ) : (
            <p>The songs could not be retrieved.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MixResults;
