import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "@react-native-community/geolocation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { n } from "@/utils/scaling";
import { buildMapStyle } from "@/utils/mapStyle";
import { useMapLayers } from "@/contexts/MapLayersContext";
import { useRoutes } from "@/contexts/RoutesContext";
MapLibreGL.setAccessToken("pk.placeholder");

const DOT_SIZE = 20;
const DOT_INNER_SIZE = 10;

export default function MapScreen() {
  const { layers } = useMapLayers();
  const MAP_STYLE = useMemo(() => buildMapStyle(layers), [layers]);
  const { activeRoute } = useRoutes();

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
    if (feature?.properties?.heading !== undefined) {
      setBearing(feature.properties.heading);
    }
    if (!mapRef.current || !coords) return;
    const point = await mapRef.current.getPointInView(coords);
    setDotScreenPos({ x: point[0], y: point[1] });
  }, [coords]);

  useEffect(() => {
    updateDotPosition();
  }, [updateDotPosition]);

  useEffect(() => {
    if (!activeRoute || !cameraRef.current) return;
    cameraRef.current.fitBounds(
      [activeRoute.bounds[2], activeRoute.bounds[3]],
      [activeRoute.bounds[0], activeRoute.bounds[1]],
      50,
      600,
    );
  }, [activeRoute]);

  const zoomToRoute = useCallback(() => {
    if (!activeRoute || !cameraRef.current) return;
    cameraRef.current.fitBounds(
      [activeRoute.bounds[2], activeRoute.bounds[3]],
      [activeRoute.bounds[0], activeRoute.bounds[1]],
      50,
      600,
    );
  }, [activeRoute]);

  const resetNorth = useCallback(() => {
    cameraRef.current?.setCamera({ heading: 0, animationDuration: 400 });
    setBearing(0);
  }, []);

  const jumpToLocation = useCallback(() => {
    if (!cameraRef.current || !coords) return;
    cameraRef.current.flyTo(coords, 400);
  }, [coords]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
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
        {activeRoute && layers.route.visible && (
          <MapLibreGL.ShapeSource id="route" shape={activeRoute.geojson}>
            <MapLibreGL.LineLayer
              id="route-line"
              style={{
                lineColor: layers.route.color ? "#ebcb8b" : "#ffffff",
                lineWidth: 3,
                lineOpacity: 0.9,
              }}
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
        {activeRoute && (
          <HapticPressable onPress={zoomToRoute}>
            <MaterialIcons name="route" size={n(48)} color="white" />
          </HapticPressable>
        )}
        <HapticPressable onPress={resetNorth}>
          <MaterialIcons
            name="explore"
            size={n(48)}
            color="white"
            style={{ transform: [{ rotate: `${-bearing - 45}deg` }] }}
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
