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
import { DEFAULT_MARKER_ICON, MARKER_ICONS } from "@/utils/markerIcons";
import { pickIconState } from "@/utils/pickIconState";
import { n } from "@/utils/scaling";

export default function NewMarkerScreen() {
  const { addMarker } = useMarkers();
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(DEFAULT_MARKER_ICON);

  useFocusEffect(
    useCallback(() => {
      if (newMarkerState.coords !== null) {
        setLat(newMarkerState.coords[1].toFixed(6));
        setLon(newMarkerState.coords[0].toFixed(6));
        newMarkerState.coords = null;
      }
      if (newMarkerState.pendingLat !== null) {
        setLat(newMarkerState.pendingLat);
        newMarkerState.pendingLat = null;
      }
      if (newMarkerState.pendingLon !== null) {
        setLon(newMarkerState.pendingLon);
        newMarkerState.pendingLon = null;
      }
      if (editPresetState.pendingName !== null) {
        setName(editPresetState.pendingName);
        editPresetState.pendingName = null;
      }
      if (pickIconState.pendingIcon !== null) {
        setIcon(pickIconState.pendingIcon);
        pickIconState.pendingIcon = null;
      }
    }, []),
  );

  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  const coordsValid = !isNaN(parsedLat) && !isNaN(parsedLon);

  const handleSave = () => {
    if (!coordsValid) return;
    addMarker({ name: name.trim() || "Unnamed", coords: [parsedLon, parsedLat], icon });
    router.back();
  };

  return (
    <ContentContainer
      headerTitle="Save Marker"
      contentGap={16}
      footer={
        <HapticPressable onPress={handleSave} style={[styles.saveButton, { opacity: coordsValid ? 1 : 0.3 }]}>
          <StyledText style={styles.saveButtonText}>Save Marker</StyledText>
        </HapticPressable>
      }
    >
      <SelectorButton
        label="Icon"
        value={MARKER_ICONS.find((i) => i.key === icon)?.label ?? icon}
        href={{ pathname: "/marker/pick-icon" }}
      />
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
