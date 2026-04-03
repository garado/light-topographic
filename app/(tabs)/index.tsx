import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "@react-native-community/geolocation";
import { useEffect, useState } from "react";
import { PermissionsAndroid, StyleSheet, View } from "react-native";

MapLibreGL.setAccessToken(null);

const OPENTOPOMAP_STYLE = JSON.stringify({
  version: 8,
  sources: {
    opentopomap: {
      type: "raster",
      tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenTopoMap (CC-BY-SA)",
    },
  },
  layers: [
    {
      id: "opentopomap",
      type: "raster",
      source: "opentopomap",
    },
  ],
});

export default function MapScreen() {
  const [coords, setCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    (async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      Geolocation.getCurrentPosition(
        (pos) => setCoords([pos.coords.longitude, pos.coords.latitude]),
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true, timeout: 15000 },
      );
    })();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapLibreGL.MapView
        style={StyleSheet.absoluteFill}
        styleJSON={OPENTOPOMAP_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
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
