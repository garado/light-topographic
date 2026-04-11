import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledText } from "@/components/StyledText";
import { useMarkers } from "@/contexts/MarkersContext";
import { newMarkerState } from "@/utils/newMarkerState";
import { editPresetState } from "@/utils/editPresetState";
import { n } from "@/utils/scaling";

export default function NewMarkerScreen() {
  const { addMarker } = useMarkers();
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [name, setName] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (newMarkerState.coords !== null) {
        setCoords(newMarkerState.coords);
        newMarkerState.coords = null;
      }
      if (editPresetState.pendingName !== null) {
        setName(editPresetState.pendingName);
        editPresetState.pendingName = null;
      }
    }, []),
  );

  const handleSave = () => {
    if (!coords) return;
    addMarker({ name: name.trim() || "Unnamed", coords });
    router.back();
  };

  const lat = coords?.[1].toFixed(6) ?? "—";
  const lon = coords?.[0].toFixed(6) ?? "—";

  return (
    <ContentContainer
      headerTitle="Save Marker"
      contentGap={32}
      footer={
        <HapticPressable onPress={handleSave} style={styles.saveButton}>
          <StyledText style={styles.saveButtonText}>Save Marker</StyledText>
        </HapticPressable>
      }
    >
      <SelectorButton
        label="Name"
        value={name || "Tap to set name"}
        href={{ pathname: "/marker/edit-name", params: { currentName: name } }}
      />
      <StyledText style={styles.coords}>{lat}</StyledText>
      <StyledText style={styles.coords}>{lon}</StyledText>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  coords: {
    fontSize: n(28),
    opacity: 0.6,
  },
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
