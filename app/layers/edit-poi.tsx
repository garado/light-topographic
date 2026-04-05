import { useState } from "react";
import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import type { LayerSettings } from "@/contexts/MapLayersContext";
import { editPoiState, type PoiLayers } from "@/utils/editPoiState";
import { n } from "@/utils/scaling";

const POI_LABELS: Record<keyof PoiLayers, string> = {
  poiCamping:    "Camping",
  poiParking:    "Parking",
  poiViewpoints: "Viewpoints",
  poiAmenities:  "Amenities",
  poiRestrooms:       "Restrooms",
  poiTransportation:  "Transportation",
};

const DEFAULT_POI: PoiLayers = {
  poiCamping:   { visible: true,  color: true  },
  poiParking:   { visible: true,  color: false },
  poiViewpoints:{ visible: true,  color: false },
  poiAmenities: { visible: false, color: false },
  poiRestrooms:      { visible: true,  color: false },
  poiTransportation: { visible: false, color: false },
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

export default function EditPoiScreen() {
  const [layers, setLayers] = useState<PoiLayers>(editPoiState.current ?? DEFAULT_POI);

  const setLayer = (key: keyof PoiLayers, field: keyof LayerSettings, value: boolean) => {
    const updated = { ...layers, [key]: { ...layers[key], [field]: value } };
    setLayers(updated);
    editPoiState.pending = updated;
  };

  return (
    <ContentContainer headerTitle="POI" contentGap={32}>
      {(Object.keys(POI_LABELS) as (keyof PoiLayers)[]).map((key) => (
        <LayerRow
          key={key}
          name={POI_LABELS[key]}
          settings={layers[key] ?? { visible: false, color: false }}
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
