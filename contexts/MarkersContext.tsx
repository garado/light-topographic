import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

export type Marker = {
  id: string;
  name: string;
  coords: [number, number]; // [lon, lat]
};

interface MarkersContextType {
  markers: Marker[];
  addMarker: (marker: Omit<Marker, "id">) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, name: string) => void;
}

const MarkersContext = createContext<MarkersContextType>({
  markers: [],
  addMarker: () => {},
  removeMarker: () => {},
  updateMarker: () => {},
});

export const useMarkers = () => useContext(MarkersContext);

export const MarkersProvider = ({ children }: { children: ReactNode }) => {
  const [markers, setMarkers] = usePersistedState<Marker[]>("markers", []);

  const addMarker = (marker: Omit<Marker, "id">) => {
    setMarkers([...markers, { ...marker, id: Date.now().toString() }]);
  };

  const removeMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id));
  };

  const updateMarker = (id: string, name: string) => {
    setMarkers(markers.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  return (
    <MarkersContext.Provider value={{ markers, addMarker, removeMarker, updateMarker }}>
      {children}
    </MarkersContext.Provider>
  );
};
