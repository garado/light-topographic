import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { StyledText } from "@/components/StyledText";
import { ToggleSwitch } from "@/components/ToggleSwitch";
import { useMapLayers, type LayerSettings, type MapLayers } from "@/contexts/MapLayersContext";
import { n } from "@/utils/scaling";

const LAYER_LABELS: Record<keyof MapLayers, string> = {
  contours: "Contours",
  trails: "Trails",
  roads: "Roads",
  water: "Water",
  labels: "Labels",
};

function LayerRow({
  name,
  settings,
  layerKey,
}: {
  name: string;
  settings: LayerSettings;
  layerKey: keyof MapLayers;
}) {
  const { setLayer } = useMapLayers();

  return (
    <View style={styles.layerRow}>
      <StyledText style={styles.layerHeader}>{name}</StyledText>
      <View style={styles.togglesRow}>
        <View style={styles.toggleHalf}>
          <ToggleSwitch
            label="Visible"
            value={settings.visible}
            onValueChange={(v) => setLayer(layerKey, "visible", v)}
          />
        </View>
        <View style={styles.toggleHalf}>
          <ToggleSwitch
            label="Color"
            value={settings.color}
            onValueChange={(v) => setLayer(layerKey, "color", v)}
          />
        </View>
      </View>
    </View>
  );
}

export default function LayersScreen() {
  const { layers } = useMapLayers();

  return (
    <ContentContainer headerTitle="Layers" hideBackButton>
      {(Object.keys(LAYER_LABELS) as (keyof MapLayers)[]).map((key) => (
        <LayerRow
          key={key}
          layerKey={key}
          name={LAYER_LABELS[key]}
          settings={layers[key]}
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
