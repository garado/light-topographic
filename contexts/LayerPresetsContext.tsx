import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useMapLayers, type MapLayers } from "@/contexts/MapLayersContext";

export type LayerPreset = {
  id: string;
  name: string;
  layers: MapLayers;
};

const DEFAULT_PRESETS: LayerPreset[] = [
  {
    id: "default",
    name: "Default",
    layers: {
      contours: { visible: true, color: true },
      trails:   { visible: true, color: true },
      roads:    { visible: true, color: false },
      labels:   { visible: true, color: false },
      water:    { visible: true, color: true },
      route:    { visible: true, color: true },
    },
  },
  {
    id: "hiking",
    name: "Hiking",
    layers: {
      contours: { visible: true, color: true },
      trails:   { visible: true, color: true },
      roads:    { visible: false, color: false },
      labels:   { visible: true, color: false },
      water:    { visible: true, color: true },
      route:    { visible: true, color: true },
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    layers: {
      contours: { visible: false, color: false },
      trails:   { visible: false, color: false },
      roads:    { visible: true, color: false },
      labels:   { visible: true, color: false },
      water:    { visible: true, color: false },
      route:    { visible: true, color: false },
    },
  },
];

interface LayerPresetsContextType {
  presets: LayerPreset[];
  activePresetId: string | null;
  savePreset: (preset: LayerPreset) => void;
  deletePreset: (id: string) => void;
  applyPreset: (id: string) => void;
}

const LayerPresetsContext = createContext<LayerPresetsContextType>({
  presets: DEFAULT_PRESETS,
  activePresetId: null,
  savePreset: () => {},
  deletePreset: () => {},
  applyPreset: () => {},
});

export const useLayerPresets = () => useContext(LayerPresetsContext);

export const LayerPresetsProvider = ({ children }: { children: ReactNode }) => {
  const [presets, setPresets] = usePersistedState<LayerPreset[]>("layerPresets", DEFAULT_PRESETS);
  const [activePresetId, setActivePresetId] = usePersistedState<string | null>("activePresetId", null);
  const { setAllLayers } = useMapLayers();

  const savePreset = (preset: LayerPreset) => {
    setPresets(
      presets.some((p) => p.id === preset.id)
        ? presets.map((p) => (p.id === preset.id ? preset : p))
        : [...presets, preset],
    );
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    if (activePresetId === id) setActivePresetId(null);
  };

  const applyPreset = (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      setAllLayers(preset.layers);
      setActivePresetId(id);
    }
  };

  return (
    <LayerPresetsContext.Provider value={{ presets, activePresetId, savePreset, deletePreset, applyPreset }}>
      {children}
    </LayerPresetsContext.Provider>
  );
};
