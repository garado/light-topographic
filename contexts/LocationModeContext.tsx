import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

export type LocationMode = "polling" | "on-demand";

interface LocationModeContextType {
  locationMode: LocationMode;
  setLocationMode: (value: LocationMode) => Promise<void>;
}

const LocationModeContext = createContext<LocationModeContextType>({
  locationMode: "polling",
  setLocationMode: async () => {},
});

export const useLocationMode = () => useContext(LocationModeContext);

export const LocationModeProvider = ({ children }: { children: ReactNode }) => {
  const [locationMode, setLocationMode] = usePersistedState<LocationMode>("locationMode", "polling");

  return (
    <LocationModeContext.Provider value={{ locationMode, setLocationMode }}>
      {children}
    </LocationModeContext.Provider>
  );
};
