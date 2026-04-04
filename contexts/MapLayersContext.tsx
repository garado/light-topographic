import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

export type LayerSettings = { visible: boolean; color: boolean };

export type MapLayers = {
  contours: LayerSettings;
  trails: LayerSettings;
  roads: LayerSettings;
  labels: LayerSettings;
  water: LayerSettings;
  route: LayerSettings;
};

const DEFAULT_LAYERS: MapLayers = {
  contours: { visible: true, color: true },
  trails: { visible: true, color: true },
  roads: { visible: true, color: false },
  labels: { visible: true, color: false },
  water: { visible: true, color: true },
  route: { visible: true, color: true },
};

interface MapLayersContextType {
  layers: MapLayers;
  setLayer: (key: keyof MapLayers, field: keyof LayerSettings, value: boolean) => void;
  setAllLayers: (layers: MapLayers) => void;
}

const MapLayersContext = createContext<MapLayersContextType>({
  layers: DEFAULT_LAYERS,
  setLayer: () => {},
  setAllLayers: () => {},
});

export const useMapLayers = () => useContext(MapLayersContext);

export const MapLayersProvider = ({ children }: { children: ReactNode }) => {
  const [rawLayers, setLayers] = usePersistedState<MapLayers>("mapLayers", DEFAULT_LAYERS);

  // Merge with defaults so newly added layers aren't undefined on old persisted state
  const layers: MapLayers = { ...DEFAULT_LAYERS, ...rawLayers };

  const setLayer = (key: keyof MapLayers, field: keyof LayerSettings, value: boolean) => {
    setLayers({ ...layers, [key]: { ...layers[key], [field]: value } });
  };

  return (
    <MapLayersContext.Provider value={{ layers, setLayer, setAllLayers: setLayers }}>
      {children}
    </MapLayersContext.Provider>
  );
};
