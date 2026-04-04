import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "@react-native-community/geolocation";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { n } from "@/utils/scaling";
import { parseGpx, type GpxRoute } from "@/utils/parseGpx";
import { buildMapStyle } from "@/utils/mapStyle";
import { useMapLayers } from "@/contexts/MapLayersContext";
MapLibreGL.setAccessToken("pk.placeholder");

const DOT_SIZE = 20;
const DOT_INNER_SIZE = 10;

export default function MapScreen() {
  const { layers } = useMapLayers();
  const MAP_STYLE = useMemo(() => buildMapStyle(layers), [layers]);

  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [dotScreenPos, setDotScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [bearing, setBearing] = useState(0);
  const [route, setRoute] = useState<GpxRoute | null>(null);

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

  useEffect(() => {
    updateDotPosition();
  }, [updateDotPosition]);

  const resetNorth = useCallback(() => {
    cameraRef.current?.setCamera({ heading: 0, animationDuration: 400 });
  }, []);

  const jumpToLocation = useCallback(() => {
    if (!cameraRef.current || !coords) return;
    cameraRef.current.flyTo(coords, 400);
  }, [coords]);

  const loadGpx = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/gpx+xml", "text/xml", "application/xml", "*/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const parsed = parseGpx(content);
    if (!parsed) return;

    setRoute(parsed);
    cameraRef.current?.fitBounds(
      [parsed.bounds[2], parsed.bounds[3]],
      [parsed.bounds[0], parsed.bounds[1]],
      50,
      600,
    );
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        onRegionIsChanging={updateDotPosition}
        onRegionDidChange={updateDotPosition}
      >
        {coords && (
          <MapLibreGL.Camera
            ref={cameraRef}
            zoomLevel={13}
            centerCoordinate={coords}
            animationMode="none"
          />
        )}
        {route && (
          <MapLibreGL.ShapeSource id="route" shape={route.geojson}>
            <MapLibreGL.LineLayer
              id="route-line"
              style={{ lineColor: "#FFD700", lineWidth: 3, lineOpacity: 0.9 }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {dotScreenPos && (
        <View
          style={[
            styles.locationDotOuter,
            { left: dotScreenPos.x - DOT_SIZE / 2, top: dotScreenPos.y - DOT_SIZE / 2 },
          ]}
          pointerEvents="none"
        >
          <View style={styles.locationDotInner} />
        </View>
      )}

      <View style={styles.buttonRow}>
        <HapticPressable onPress={loadGpx}>
          <MaterialIcons name="route" size={n(48)} color="white" />
        </HapticPressable>
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
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationDotInner: {
    width: DOT_INNER_SIZE,
    height: DOT_INNER_SIZE,
    borderRadius: DOT_INNER_SIZE / 2,
    backgroundColor: "#ffffff",
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
