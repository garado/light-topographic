import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

export type Marker = {
  id: string;
  name: string;
  coords: [number, number]; // [lon, lat]
  visible: boolean;
  icon: string;
};

interface MarkersContextType {
  markers: Marker[];
  addMarker: (marker: Omit<Marker, "id" | "visible">) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, name: string, coords: [number, number], icon: string) => void;
  toggleMarkerVisibility: (id: string) => void;
}

const MarkersContext = createContext<MarkersContextType>({
  markers: [],
  addMarker: () => {},
  removeMarker: () => {},
  updateMarker: () => {},
  toggleMarkerVisibility: () => {},
});

export const useMarkers = () => useContext(MarkersContext);

export const MarkersProvider = ({ children }: { children: ReactNode }) => {
  const [markers, setMarkers] = usePersistedState<Marker[]>("markers", []);

  const addMarker = (marker: Omit<Marker, "id" | "visible">) => {
    setMarkers([...markers, { ...marker, id: Date.now().toString(), visible: true }]);
  };

  const removeMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id));
  };

  const updateMarker = (id: string, name: string, coords: [number, number], icon: string) => {
    setMarkers(markers.map((m) => (m.id === id ? { ...m, name, coords, icon } : m)));
  };

  const toggleMarkerVisibility = (id: string) => {
    setMarkers(markers.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
  };

  return (
    <MarkersContext.Provider value={{ markers, addMarker, removeMarker, updateMarker, toggleMarkerVisibility }}>
      {children}
    </MarkersContext.Provider>
  );
};
