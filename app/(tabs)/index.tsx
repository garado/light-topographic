import MapLibreGL from "@maplibre/maplibre-react-native";
import Geolocation from "@react-native-community/geolocation";
import CompassHeading from "react-native-compass-heading";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, PermissionsAndroid, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { n } from "@/utils/scaling";
import { buildMapStyle } from "@/utils/mapStyle";
import { useMapLayers } from "@/contexts/MapLayersContext";
import { useRoutes } from "@/contexts/RoutesContext";
MapLibreGL.setAccessToken("pk.placeholder");
MapLibreGL.offlineManager.setTileCountLimit(5000);

const DOT_SIZE = 12;
const CONE_HEIGHT = DOT_SIZE * 1.5;
const CONE_HALF_WIDTH = DOT_SIZE / 2;

export default function MapScreen() {
  const { layers } = useMapLayers();
  const MAP_STYLE = useMemo(() => buildMapStyle(layers), [layers]);
  const { activeRoute } = useRoutes();

  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const watchIdRef = useRef<number | null>(null);

  // Heading tracked as refs to avoid re-renders; Animated.Value drives the cone
  const userHeadingRef = useRef<number | null>(null);
  const bearingRef = useRef(0);
  const coneRotationAnim = useRef(new Animated.Value(0)).current;
  const [hasHeading, setHasHeading] = useState(false);

  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [initialCoords, setInitialCoords] = useState<[number, number] | null>(null);
  const [dotScreenPos, setDotScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    (async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

      watchIdRef.current = Geolocation.watchPosition(
        (pos) => {
          const c: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setCoords(c);
          setInitialCoords((prev) => prev ?? c);
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true, distanceFilter: 0 },
      );
    })();

    CompassHeading.start(1, ({ heading }: { heading: number }) => {
      userHeadingRef.current = heading;
      coneRotationAnim.setValue(heading - bearingRef.current);
      if (!hasHeading) setHasHeading(true);
    });

    return () => {
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      CompassHeading.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDotPosition = useCallback(async (feature?: { properties?: { heading?: number } }) => {
    if (feature?.properties?.heading !== undefined) {
      bearingRef.current = feature.properties.heading;
      setBearing(feature.properties.heading);
      if (userHeadingRef.current !== null) {
        coneRotationAnim.setValue(userHeadingRef.current - feature.properties.heading);
      }
    }
    if (!mapRef.current || !coords) return;
    const point = await mapRef.current.getPointInView(coords);
    setDotScreenPos({ x: point[0], y: point[1] });
  }, [coords, coneRotationAnim]);

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
    bearingRef.current = 0;
    setBearing(0);
    if (userHeadingRef.current !== null) {
      coneRotationAnim.setValue(userHeadingRef.current);
    }
  }, [coneRotationAnim]);

  const jumpToLocation = useCallback(() => {
    if (!cameraRef.current || !coords) return;
    cameraRef.current.flyTo(coords, 400);
  }, [coords]);

  const coneRotateStyle = {
    transform: [
      {
        rotate: coneRotationAnim.interpolate({
          inputRange: [-720, 720],
          outputRange: ["-720deg", "720deg"],
          extrapolate: "extend",
        }),
      },
    ],
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]}>
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
        {initialCoords && (
          <MapLibreGL.Camera
            ref={cameraRef}
            zoomLevel={13}
            centerCoordinate={initialCoords}
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

      {dotScreenPos && hasHeading && (
        <Animated.View
          style={[
            styles.coneContainer,
            {
              left: dotScreenPos.x - CONE_HALF_WIDTH,
              top: dotScreenPos.y - CONE_HEIGHT,
            },
            coneRotateStyle,
          ]}
          pointerEvents="none"
        >
          <View style={styles.cone} />
          {/* bottom half is empty — exists so container center aligns with dot */}
        </Animated.View>
      )}

      {dotScreenPos && (
        <View
          style={[
            styles.locationDot,
            { left: dotScreenPos.x - DOT_SIZE / 2, top: dotScreenPos.y - DOT_SIZE / 2 },
          ]}
          pointerEvents="none"
        />
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
  coneContainer: {
    position: "absolute",
    width: CONE_HALF_WIDTH * 2,
    height: CONE_HEIGHT * 2,  // double height: center = dot, cone in top half
    alignItems: "center",
    justifyContent: "flex-start",
  },
  cone: {
    width: 0,
    height: 0,
    borderLeftWidth: CONE_HALF_WIDTH,
    borderRightWidth: CONE_HALF_WIDTH,
    borderBottomWidth: CONE_HEIGHT,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(255, 255, 255, 0.25)",
  },
  locationDot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
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
