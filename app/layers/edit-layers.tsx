import { useState } from "react";
import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { LayerSettings } from "@/contexts/MapLayersContext";
import { editLayersState, type CoreLayers } from "@/utils/editLayersState";
import { n } from "@/utils/scaling";

const LAYER_LABELS: Record<keyof CoreLayers, string> = {
  contours: "Contours",
  trails:   "Trails",
  roads:    "Roads",
  water:    "Water",
  labels:   "Labels",
  route:    "Route",
};

const DEFAULT_LAYERS: CoreLayers = {
  contours: { visible: true,  color: true  },
  trails:   { visible: true,  color: true  },
  roads:    { visible: true,  color: false },
  water:    { visible: true,  color: true  },
  labels:   { visible: true,  color: false },
  route:    { visible: true,  color: true  },
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

export default function EditLayersScreen() {
  const [layers, setLayers] = useState<CoreLayers>(editLayersState.current ?? DEFAULT_LAYERS);

  const setLayer = (key: keyof CoreLayers, field: keyof LayerSettings, value: boolean) => {
    const updated = { ...layers, [key]: { ...layers[key], [field]: value } };
    setLayers(updated);
    editLayersState.pending = updated;
  };

  return (
    <ContentContainer headerTitle="Layers" contentGap={32}>
      {(Object.keys(LAYER_LABELS) as (keyof CoreLayers)[]).map((key) => (
        <LayerRow
          key={key}
          name={LAYER_LABELS[key]}
          settings={layers[key]}
          onChange={(field, value) => setLayer(key, field, value)}
        />
      ))}
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  layerRow: {
    width: "100%",
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
