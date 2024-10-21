import { useContext } from "react";
import { TabContext } from "../contexts/TabContext";

const useTab = () => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};

export default useTab;