import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "@react-native-community/geolocation";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { NativeModules } from "react-native";

const { MLRNModule } = NativeModules;
import { StyleSheet, View } from "react-native";
import { Header } from "@/components/Header";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { type MapLayers, useMapLayers } from "@/contexts/MapLayersContext";
import { buildMapStyle } from "@/utils/mapStyle";
import { n } from "@/utils/scaling";

export default function CachedTilesScreen() {
  const { invertColors } = useInvertColors();
  const { layers, setAllLayers } = useMapLayers();
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
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
      return () => {
        MLRNModule.setConnected(true);
        if (snapshot.current) setAllLayers(snapshot.current);
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={[styles.screen, { backgroundColor: invertColors ? "white" : "black" }]}>
      <Header headerTitle="Cached Tiles" />
      <View style={styles.banner}>
        <StyledText style={styles.bannerText}>
          Offline mode (only cached tiles are shown)
        </StyledText>
      </View>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={false}
      >
        {coords && (
          <MapLibreGL.Camera
            zoomLevel={13}
            centerCoordinate={coords}
            animationMode="none"
          />
        )}
      </MapLibreGL.MapView>
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
  map: {
    flex: 1,
  },
});
