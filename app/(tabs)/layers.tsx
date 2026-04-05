import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledButton } from "@/components/StyledButton";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useLayerPresets, type LayerPreset } from "@/contexts/LayerPresetsContext";
import { n } from "@/utils/scaling";

function PresetRow({
  preset,
  editMode,
  active,
  onPress,
  onDelete,
}: {
  preset: LayerPreset;
  editMode: boolean;
  active: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { invertColors } = useInvertColors();

  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <StyledButton text={preset.name} selected={active} onPress={onPress} />
      </View>
      {editMode && (
        <HapticPressable onPress={onDelete} style={styles.deleteBtn}>
          <MaterialIcons
            name="close"
            size={n(20)}
            color={invertColors ? "black" : "white"}
            style={{ opacity: 0.4 }}
          />
        </HapticPressable>
      )}
    </View>
  );
}

export default function LayersScreen() {
  const { presets, activePresetId, applyPreset, deletePreset } = useLayerPresets();
  const [editMode, setEditMode] = useState(false);

  return (
    <ContentContainer
      headerTitle="Layers"
      hideBackButton
      rightActions={[
        {
          icon: "edit",
          onPress: () => setEditMode((v) => !v),
          active: editMode,
        },
        {
          icon: "add",
          onPress: () => router.push("/layers/edit-preset?presetId=new"),
        },
      ]}
    >
      <View style={styles.presetList}>
        {presets.map((preset) => (
          <PresetRow
            key={preset.id}
            preset={preset}
            editMode={editMode}
            active={preset.id === activePresetId}
            onPress={() => editMode
              ? router.push(`/layers/edit-preset?presetId=${preset.id}`)
              : applyPreset(preset.id)
            }
            onDelete={() => deletePreset(preset.id)}
          />
        ))}
      </View>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  rowContent: {
    flex: 1,
  },
  deleteBtn: {
    paddingTop: n(8)
  },
  presetList: {
    gap: n(26)
  },
});
