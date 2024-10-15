import React, { useState, useEffect } from "react";

interface ToggleButtonProps {
  color?: string;
  text?: string;
  initialState?: boolean;
  onToggle?: (state: boolean) => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  text = "",
  initialState = false,
  onToggle,
}) => {
  const [isToggled, setIsToggled] = useState(initialState);

  useEffect(() => {
    setIsToggled(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isToggled;
    setIsToggled(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <span className="inline-flex items-center space-x-2">
      {text && <p className="text-indigo-700">{text}</p>}
      <button
        onClick={handleToggle}
        className={`${
          isToggled ? "bg-indigo-500" : "bg-gray-500"
        } relative inline-flex h-4 w-10 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none`}
      >
        <span
          className={`${
            isToggled ? "translate-x-6" : "translate-x-0"
          } inline-block h-3.5 w-3.5 transform bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out`}
        />
      </button>
    </span>
  );
};

export default ToggleButton;
