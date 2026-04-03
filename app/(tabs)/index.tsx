import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "@react-native-community/geolocation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PermissionsAndroid, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { useMapStyle } from "@/contexts/MapStyleContext";
import { n } from "@/utils/scaling";

const MAP_FILTERS: Record<string, object[]> = {
  color: [],
  white: [{ grayscale: 1 }],
  black: [{ grayscale: 1 }, { invert: 1 }],
};

MapLibreGL.setAccessToken(null);

const EMPTY_STYLE = JSON.stringify({ version: 8, sources: {}, layers: [] });

const DOT_SIZE = 20;
const DOT_INNER_SIZE = 10;

export default function MapScreen() {
  const { mapStyle } = useMapStyle();
  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [dotScreenPos, setDotScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [bearing, setBearing] = useState(0);

  const fetchLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  useEffect(() => {
    (async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      fetchLocation();
    })();
  }, [fetchLocation]);

  const updateDotPosition = useCallback(async (feature?: { properties?: { heading?: number } }) => {
    if (!mapRef.current || !coords) return;
    const point = await mapRef.current.getPointInView(coords);
    setDotScreenPos({ x: point[0], y: point[1] });
    if (feature?.properties?.heading !== undefined) {
      setBearing(feature.properties.heading);
    }
  }, [coords]);

  const resetNorth = useCallback(() => {
    cameraRef.current?.setCamera({ heading: 0, animationDuration: 400 });
  }, []);

  useEffect(() => {
    updateDotPosition();
  }, [updateDotPosition]);

  const jumpToLocation = useCallback(() => {
    if (!cameraRef.current || !coords) return;
    cameraRef.current.flyTo(coords, 400);
  }, [coords]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={[StyleSheet.absoluteFill, { filter: MAP_FILTERS[mapStyle] }]}
        styleJSON={EMPTY_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionIsChanging={updateDotPosition}
        onRegionDidChange={updateDotPosition}
      >
        <MapLibreGL.RasterSource
          id="opentopomap"
          tileUrlTemplates={["https://tile.opentopomap.org/{z}/{x}/{y}.png"]}
          tileSize={256}
        >
          <MapLibreGL.RasterLayer id="opentopomap-layer" />
        </MapLibreGL.RasterSource>
        {coords && (
          <MapLibreGL.Camera
            ref={cameraRef}
            zoomLevel={13}
            centerCoordinate={coords}
            animationMode="none"
          />
        )}
      </MapLibreGL.MapView>
      {dotScreenPos && (
        <View
          style={[
            styles.locationDotOuter,
            {
              left: dotScreenPos.x - DOT_SIZE / 2,
              top: dotScreenPos.y - DOT_SIZE / 2,
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.locationDotInner} />
        </View>
      )}
      <View style={styles.buttonRow}>
        <HapticPressable onPress={resetNorth}>
          <MaterialIcons
            name="explore"
            size={n(48)}
            color="white"
            style={{ transform: [{ rotate: `${-bearing}deg` }] }}
          />
        </HapticPressable>
        <HapticPressable onPress={jumpToLocation}>
          <MaterialIcons name="my-location" size={n(48)} color="white" />
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  locationDotOuter: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "rgba(255, 100, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationDotInner: {
    width: DOT_INNER_SIZE,
    height: DOT_INNER_SIZE,
    borderRadius: DOT_INNER_SIZE / 2,
    backgroundColor: "#FF6400",
  },
  buttonRow: {
    position: "absolute",
    bottom: n(20),
    right: n(20),
    flexDirection: "row",
    gap: n(20),
    alignItems: "center",
  },
});
