import React, { useEffect, useRef, useState } from "react";

interface SpotifyEmbedProps {
  id: string; // Accepts the track ID as a prop
}

const SpotifyEmbed: React.FC<SpotifyEmbedProps> = ({ id }) => {
  const embedRef = useRef<HTMLDivElement | null>(null);
  const [embedControlla, setEmbedController] = useState<any>(null); // Track the embed controller

  useEffect(() => {
    // Create and append the Spotify API script
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;

    document.head.appendChild(script);

    // Define the callback function that Spotify will call when the API is ready
    const onSpotifyIframeApiReady = (IFrameAPI) => {
      if (embedRef.current) {
        const options = {
          uri: `spotify:track:${id}`, // Example track URI
          width: "100%",
          height: "100%",
        };

        const callback = (embedController) => {
          embedController.loadUri(`spotify:track:${id}`);
          embedController.play();
          document.querySelectorAll(".track").forEach((track) => {
            track.addEventListener("click", () => {
              // click event handler logic goes here
              embedController.loadUri(
                `spotify:track:${track.dataset.spotifyId}`
              );
              embedController.play();
            });
          });
        };

        // Create the controller for the embed
        IFrameAPI.createController(embedRef.current, options, callback);
      }
    };

    // Assign the event handler to the global window object
    window.onSpotifyIframeApiReady = onSpotifyIframeApiReady;

    // Cleanup function to remove the script and event handler
    return () => {
      window.onSpotifyIframeApiReady = null; // Clean up the event handler
      document.head.removeChild(script);
    };
  }, [id]); // Run effect when `id` changes

  return (
    <div
      ref={embedRef}
    ></div>
  );
};

export default SpotifyEmbed;
