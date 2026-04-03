import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

export type MapStyle = "color" | "white" | "black";

interface MapStyleContextType {
  mapStyle: MapStyle;
  setMapStyle: (value: MapStyle) => Promise<void>;
}

const MapStyleContext = createContext<MapStyleContextType>({
  mapStyle: "black",
  setMapStyle: () => {
    throw new Error("useMapStyle must be used within MapStyleProvider");
  },
});

export const useMapStyle = () => useContext(MapStyleContext);

export const MapStyleProvider = ({ children }: { children: ReactNode }) => {
  const [mapStyle, setMapStyle] = usePersistedState<MapStyle>("mapStyle", "black");

  return (
    <MapStyleContext.Provider value={{ mapStyle, setMapStyle }}>
      {children}
    </MapStyleContext.Provider>
  );
};
