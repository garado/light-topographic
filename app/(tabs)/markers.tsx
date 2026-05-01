/**
 * @file markers.tsx
 * @description Map marker management.
 */

import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { Header } from "@/components/Header";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useMarkers, type Marker } from "@/contexts/MarkersContext";
import { editMarkerState } from "@/utils/editMarkerState";
import { mapFocusState } from "@/utils/mapFocusState";
import { n } from "@/utils/scaling";

function MarkerRow({
  marker,
  editMode,
  onPress,
  onDelete,
  onToggleVisibility,
}: {
  marker: Marker;
  editMode: boolean;
  onPress: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const { invertColors } = useInvertColors();
  const iconColor = invertColors ? "black" : "white";
  const visible = marker.visible !== false;
  return (
    <View style={styles.row}>
      <MaterialIcons
        name={(marker.icon ?? "place") as any}
        size={n(22)}
        color={iconColor}
        style={!visible ? styles.hidden : undefined}
      />
      <HapticPressable style={styles.rowContent} onPress={onPress}>
        <StyledText style={[styles.markerName, !visible && styles.hidden]}>{marker.name}</StyledText>
        <StyledText style={styles.coords}>
          {marker.coords[1].toFixed(6)}, {marker.coords[0].toFixed(6)}
        </StyledText>
      </HapticPressable>
      <HapticPressable onPress={onToggleVisibility} style={styles.iconBtn}>
        <MaterialIcons
          name={visible ? "visibility" : "visibility-off"}
          size={n(20)}
          color={iconColor}
          style={visible ? null : styles.hidden}
        />
      </HapticPressable>
      {editMode && (
        <HapticPressable onPress={onDelete} style={styles.iconBtn}>
          <MaterialIcons name="close" size={n(20)} color={iconColor} style={styles.dimmed} />
        </HapticPressable>
      )}
    </View>
  );
}

export default function MarkersScreen() {
  const { markers, removeMarker, toggleMarkerVisibility } = useMarkers();
  const { invertColors } = useInvertColors();
  const [editMode, setEditMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEditMode(false);
    }, []),
  );

  const handleMarkerPress = (marker: Marker) => {
    if (editMode) {
      editMarkerState.id = marker.id;
      router.push({
        pathname: "/marker/edit",
        params: {
          currentName: marker.name,
          currentLat: marker.coords[1].toFixed(6),
          currentLon: marker.coords[0].toFixed(6),
          currentIcon: marker.icon ?? "place",
        },
      });
    } else {
      mapFocusState.flyTo = marker.coords;
      router.navigate("/");
    }
  };

  if (markers.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: invertColors ? "white" : "black" }]}>
        <Header
          headerTitle="Markers"
          hideBackButton
          rightAction={{ icon: "add", onPress: () => router.push("/marker/new") }}
        />
        <View style={styles.emptyState}>
          <StyledText style={styles.emptyMessage}>No markers saved</StyledText>
          <StyledText style={styles.emptyHint}>Long press on the map to add a marker</StyledText>
        </View>
      </View>
    );
  }

  return (
    <ContentContainer
      headerTitle="Markers"
      hideBackButton
      rightActions={[
        {
          icon: "edit",
          onPress: () => setEditMode((v) => !v),
          active: editMode,
        },
        {
          icon: "add",
          onPress: () => router.push("/marker/new"),
          active: false,
        },
      ]}
    >
      <View style={styles.list}>
        {markers.map((marker) => (
          <MarkerRow
            key={marker.id}
            marker={marker}
            editMode={editMode}
            onPress={() => handleMarkerPress(marker)}
            onDelete={() => removeMarker(marker.id)}
            onToggleVisibility={() => toggleMarkerVisibility(marker.id)}
          />
        ))}
      </View>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: n(8),
  },
  emptyMessage: {
    fontSize: n(26),
    textAlign: "center",
  },
  emptyHint: {
    fontSize: n(16),
    textAlign: "center",
    opacity: 0.5,
  },
  list: {
    gap: n(26),
    paddingBottom: n(12),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: n(12),
    width: "100%",
  },
  rowContent: {
    flex: 1,
    gap: n(4),
  },
  markerName: {
    fontSize: n(26),
  },
  coords: {
    fontSize: n(12),
  },
  iconBtn: {
    paddingTop: n(8),
  },
  hidden: {
    opacity: 0.35,
  },
  dimmed: {
    opacity: 0.4,
  },
});
