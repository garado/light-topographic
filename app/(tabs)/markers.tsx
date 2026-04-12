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
}: {
  marker: Marker;
  editMode: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { invertColors } = useInvertColors();
  return (
    <View style={styles.row}>
      <HapticPressable style={styles.rowContent} onPress={onPress}>
        <StyledText style={styles.markerName}>{marker.name}</StyledText>
        <StyledText style={styles.coords}>
          {marker.coords[1].toFixed(6)}, {marker.coords[0].toFixed(6)}
        </StyledText>
      </HapticPressable>
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

export default function MarkersScreen() {
  const { markers, removeMarker } = useMarkers();
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
          <StyledText style={styles.emptyHint}>Long press on the map to add one</StyledText>
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
  deleteBtn: {
    paddingTop: n(8),
  },
});
