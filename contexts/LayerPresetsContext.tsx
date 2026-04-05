import { createContext, type ReactNode, useContext } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useMapLayers, type MapLayers } from "@/contexts/MapLayersContext";
import { DEFAULT_PRESETS } from "@/utils/defaultPresets";

export type LayerPreset = {
  id: string;
  name: string;
  layers: MapLayers;
};

interface LayerPresetsContextType {
  presets: LayerPreset[];
  activePresetId: string | null;
  savePreset: (preset: LayerPreset) => void;
  deletePreset: (id: string) => void;
  applyPreset: (id: string) => void;
  resetToDefaults: () => void;
}

const LayerPresetsContext = createContext<LayerPresetsContextType>({
  presets: DEFAULT_PRESETS,
  activePresetId: null,
  savePreset: () => {},
  deletePreset: () => {},
  applyPreset: () => {},
  resetToDefaults: () => {},
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

  const resetToDefaults = () => {
    setPresets(DEFAULT_PRESETS);
    setActivePresetId(null);
  };

  return (
    <LayerPresetsContext.Provider value={{ presets, activePresetId, savePreset, deletePreset, applyPreset, resetToDefaults }}>
      {children}
    </LayerPresetsContext.Provider>
  );
};
