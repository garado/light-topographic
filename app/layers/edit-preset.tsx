import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { editPresetState } from "@/utils/editPresetState";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledText } from "@/components/StyledText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useLayerPresets } from "@/contexts/LayerPresetsContext";
import { type LayerSettings, type MapLayers } from "@/contexts/MapLayersContext";
import { n } from "@/utils/scaling";

const LAYER_LABELS: Record<keyof MapLayers, string> = {
  contours: "Contours",
  trails: "Trails",
  roads: "Roads",
  water: "Water",
  labels: "Labels",
  route: "Route",
};

const DEFAULT_LAYERS: MapLayers = {
  contours: { visible: true, color: true },
  trails:   { visible: true, color: true },
  roads:    { visible: true, color: false },
  labels:   { visible: true, color: false },
  water:    { visible: true, color: true },
  route:    { visible: true, color: true },
};

function LayerRow({
  name,
  settings,
  onChange,
}: {
  name: string;
  settings: LayerSettings;
  onChange: (field: keyof LayerSettings, value: boolean) => void;
}) {
  return (
    <View style={styles.layerRow}>
      <StyledText style={styles.layerHeader}>{name}</StyledText>
      <View style={styles.togglesRow}>
        <View style={styles.toggleHalf}>
          <ToggleSwitch
            label="Visible"
            value={settings.visible}
            onValueChange={(v) => onChange("visible", v)}
          />
        </View>
        <View style={styles.toggleHalf}>
          <ToggleSwitch
            label="Color"
            value={settings.color}
            onValueChange={(v) => onChange("color", v)}
          />
        </View>
      </View>
    </View>
  );
}

export default function EditPresetScreen() {
  const { presetId } = useLocalSearchParams<{ presetId: string }>();
  const { presets, savePreset } = useLayerPresets();

  const existing = presetId !== "new" ? presets.find((p) => p.id === presetId) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [layers, setLayers] = useState<MapLayers>(existing?.layers ?? DEFAULT_LAYERS);

  useFocusEffect(
    useCallback(() => {
      if (editPresetState.pendingName !== null) {
        setName(editPresetState.pendingName);
        editPresetState.pendingName = null;
      }
    }, []),
  );

  const setLayer = (key: keyof MapLayers, field: keyof LayerSettings, value: boolean) => {
    setLayers((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    savePreset({
      id: existing?.id ?? Date.now().toString(),
      name: name.trim(),
      layers,
    });
    router.back();
  };

  return (
    <ContentContainer
      headerTitle={existing ? "Edit Preset" : "New Preset"}
      contentGap={32}
    >
      <SelectorButton
        label="Preset Name"
        value={name || "Tap to set name"}
        href={{ pathname: "/layers/edit-preset-name", params: { presetId, currentName: name } }}
      />
      {(Object.keys(LAYER_LABELS) as (keyof MapLayers)[]).map((key) => (
        <LayerRow
          key={key}
          name={LAYER_LABELS[key]}
          settings={layers[key]}
          onChange={(field, value) => setLayer(key, field, value)}
        />
      ))}
      <HapticPressable onPress={handleSave} style={styles.saveButton}>
        <StyledText style={styles.saveButtonText}>Save Preset</StyledText>
      </HapticPressable>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  layerRow: {
    width: "100%",
  },
  saveButton: {
    alignItems: "center",
    width: "100%",
  },
  saveButtonText: {
    fontSize: n(40),
    textTransform: "uppercase",
  },
  layerHeader: {
    fontSize: n(22),
    marginBottom: n(-12),
  },
  togglesRow: {
    flexDirection: "row",
    width: "100%",
  },
  toggleHalf: {
    flex: 1,
  },
});
