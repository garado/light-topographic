import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "@react-native-community/geolocation";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { NativeModules } from "react-native";

const { MLRNModule } = NativeModules;
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { type MapLayers, useMapLayers } from "@/contexts/MapLayersContext";
import { useRoutes } from "@/contexts/RoutesContext";
import { buildMapStyle } from "@/utils/mapStyle";
import { n } from "@/utils/scaling";
import { useColor } from "@/hooks/useColor";

export default function CachedTilesScreen() {
  useColor();

  const { invertColors } = useInvertColors();
  const { layers, setAllLayers } = useMapLayers();
  const { activeRoute } = useRoutes();
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const snapshot = useRef<MapLayers | null>(null);
  const MAP_STYLE = useMemo(() => buildMapStyle(layers), [layers]);
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useFocusEffect(
    useCallback(() => {
      snapshot.current = layers;
      const allVisible = Object.fromEntries(
        Object.entries(layers).map(([k, v]) => [k, { ...(v as object), visible: true }]),
      ) as MapLayers;
      setAllLayers(allVisible);
      MLRNModule.setConnected(false);
      Geolocation.getCurrentPosition(
        (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
        () => { },
        { enableHighAccuracy: true, timeout: 5000 },
      );
      return () => {
        MLRNModule.setConnected(true);
        if (snapshot.current) setAllLayers(snapshot.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),);

  return (
    <View style={[styles.screen, { backgroundColor: invertColors ? "white" : "black" }]}>
      <Header headerTitle="Cached Tiles" />
      <View style={styles.banner}>
        <StyledText style={styles.bannerText}>
          Offline mode (only cached tiles are shown)
        </StyledText>
      </View>
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={StyleSheet.absoluteFill}
          mapStyle={MAP_STYLE}
          logoEnabled={false}
          attributionEnabled={false}
          compassEnabled={false}
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
        {activeRoute && (
          <View style={styles.buttonRow}>
            <HapticPressable onPress={() => {
              if (!activeRoute || !cameraRef.current) return;
              cameraRef.current.fitBounds(
                [activeRoute.bounds[2], activeRoute.bounds[3]],
                [activeRoute.bounds[0], activeRoute.bounds[1]],
                50, 600,
              );
            }}>
              <MaterialIcons name="route" size={n(48)} color={invertColors ? "black" : "white"} />
            </HapticPressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  banner: {
    alignItems: "center",
    paddingHorizontal: n(37),
    paddingVertical: n(8),
  },
  bannerText: {
    fontSize: n(14),
    opacity: 0.5,
  },
  mapContainer: {
    flex: 1,
  },
  buttonRow: {
    position: "absolute",
    bottom: n(10),
    right: n(10),
    elevation: 10,
  },
});
