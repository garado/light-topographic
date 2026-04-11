import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { editPresetState } from "@/utils/editPresetState";
import { editLayersState } from "@/utils/editLayersState";
import { editPoiState } from "@/utils/editPoiState";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { StyledText } from "@/components/StyledText";
import { useLayerPresets } from "@/contexts/LayerPresetsContext";
import { useMapLayers, type MapLayers } from "@/contexts/MapLayersContext";
import { n } from "@/utils/scaling";

const DEFAULT_LAYERS: MapLayers = {
  contours: { visible: true, color: true },
  trails: { visible: true, color: true },
  roads: { visible: true, color: false },
  labels: { visible: true, color: false },
  water: { visible: true, color: true },
  route: { visible: true, color: true },
  poiCamping: { visible: true, color: true },
  poiParking: { visible: true, color: false },
  poiViewpoints: { visible: true, color: false },
  poiAmenities: { visible: false, color: false },
  poiRestrooms: { visible: false, color: false },
  poiTransportation: { visible: false, color: false },
};

export default function EditPresetScreen() {
  const { presetId } = useLocalSearchParams<{ presetId: string }>();
  const { presets, savePreset, activePresetId } = useLayerPresets();
  const { setAllLayers } = useMapLayers();

  const existing = presetId !== "new" ? presets.find((p) => p.id === presetId) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [layers, setLayers] = useState<MapLayers>(existing?.layers ?? DEFAULT_LAYERS);

  useFocusEffect(
    useCallback(() => {
      if (editPresetState.pendingName !== null) {
        setName(editPresetState.pendingName);
        editPresetState.pendingName = null;
      }
      if (editLayersState.pending !== null) {
        setLayers((prev) => ({ ...prev, ...editLayersState.pending }));
        editLayersState.pending = null;
      }
      if (editPoiState.pending !== null) {
        setLayers((prev) => ({ ...prev, ...editPoiState.pending }));
        editPoiState.pending = null;
      }
    }, []),
  );

  const handleSave = () => {
    const id = existing?.id ?? Date.now().toString();
    savePreset({ id, name: name.trim() || "Unnamed", layers });
    if (activePresetId === id) setAllLayers(layers);
    router.back();
  };

  return (
    <ContentContainer
      headerTitle={existing ? "Edit Preset" : "New Preset"}
      contentGap={32}
      footer={
        <HapticPressable onPress={handleSave} style={styles.saveButton}>
          <StyledText style={styles.saveButtonText}>Save Preset</StyledText>
        </HapticPressable>
      }
    >
      <SelectorButton
        label="Preset Name"
        value={name || "Tap to set name"}
        href={{ pathname: "/layers/edit-preset-name", params: { presetId, currentName: name } }}
      />
      <StyledButton
        text="Layers"
        onPress={() => {
          editLayersState.current = {
            contours: layers.contours,
            trails: layers.trails,
            roads: layers.roads,
            water: layers.water,
            labels: layers.labels,
            route: layers.route,
          };
          router.push("/layers/edit-layers");
        }}
      />
      <StyledButton
        text="POI"
        onPress={() => {
          editPoiState.current = {
            poiCamping: layers.poiCamping,
            poiParking: layers.poiParking,
            poiViewpoints: layers.poiViewpoints,
            poiAmenities: layers.poiAmenities,
            poiRestrooms: layers.poiRestrooms,
            poiTransportation: layers.poiTransportation,
          };
          router.push("/layers/edit-poi");
        }}
      />
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    alignItems: "center",
    width: "100%",
  },
  saveButtonText: {
    fontSize: n(28),
    textTransform: "uppercase",
    letterSpacing: n(5),
  },
});
