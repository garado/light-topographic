import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledText } from "@/components/StyledText";
import { useMarkers } from "@/contexts/MarkersContext";
import { editMarkerState } from "@/utils/editMarkerState";
import { editPresetState } from "@/utils/editPresetState";
import { newMarkerState } from "@/utils/newMarkerState";
import { n } from "@/utils/scaling";

export default function EditMarkerScreen() {
  const { currentName, currentLat, currentLon } = useLocalSearchParams<{
    currentName: string;
    currentLat: string;
    currentLon: string;
  }>();
  const { updateMarker } = useMarkers();
  const [name, setName] = useState(currentName ?? "");
  const [lat, setLat] = useState(currentLat ?? "");
  const [lon, setLon] = useState(currentLon ?? "");

  useFocusEffect(
    useCallback(() => {
      if (editPresetState.pendingName !== null) {
        setName(editPresetState.pendingName);
        editPresetState.pendingName = null;
      }
      if (newMarkerState.pendingLat !== null) {
        setLat(newMarkerState.pendingLat);
        newMarkerState.pendingLat = null;
      }
      if (newMarkerState.pendingLon !== null) {
        setLon(newMarkerState.pendingLon);
        newMarkerState.pendingLon = null;
      }
    }, []),
  );

  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  const coordsValid = !isNaN(parsedLat) && !isNaN(parsedLon);

  const handleSave = () => {
    if (!coordsValid || editMarkerState.id === null) return;
    updateMarker(editMarkerState.id, name.trim() || "Unnamed", [parsedLon, parsedLat]);
    editMarkerState.id = null;
    router.back();
  };

  return (
    <ContentContainer
      headerTitle="Edit Marker"
      contentGap={32}
      footer={
        <HapticPressable onPress={handleSave} style={[styles.saveButton, { opacity: coordsValid ? 1 : 0.3 }]}>
          <StyledText style={styles.saveButtonText}>Save Marker</StyledText>
        </HapticPressable>
      }
    >
      <SelectorButton
        label="Name"
        value={name || "Tap to set name"}
        href={{ pathname: "/marker/edit-name", params: { currentName: name } }}
      />
      <SelectorButton
        label="Latitude"
        value={lat || "Tap to set latitude"}
        href={{ pathname: "/marker/edit-coord", params: { field: "lat", currentValue: lat } }}
      />
      <SelectorButton
        label="Longitude"
        value={lon || "Tap to set longitude"}
        href={{ pathname: "/marker/edit-coord", params: { field: "lon", currentValue: lon } }}
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
