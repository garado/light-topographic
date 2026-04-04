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
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useRoutes } from "@/contexts/RoutesContext";
MapLibreGL.setAccessToken("pk.placeholder");

enum LocateMode { Free, Centered, Following }
enum CompassMode { Free, North, Heading }
MapLibreGL.offlineManager.setTileCountLimit(5000);

const DOT_SIZE = 12;
const CONE_HEIGHT = DOT_SIZE * 1.5;
const CONE_HALF_WIDTH = DOT_SIZE / 2;

export default function MapScreen() {
  const { layers } = useMapLayers();
  const { invertColors } = useInvertColors();
  const MAP_STYLE = useMemo(() => buildMapStyle(layers, invertColors), [layers, invertColors]);
  const { activeRoute } = useRoutes();

  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const watchIdRef = useRef<number | null>(null);

  // Heading tracked as refs to avoid re-renders; Animated.Value drives the cone
  const userHeadingRef = useRef<number | null>(null);
  const bearingRef = useRef(0);
  const coordsRef = useRef<[number, number] | null>(null);
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
          coordsRef.current = c;
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

      if (compassModeRef.current === CompassMode.Heading && cameraRef.current) {
        suppressResetRef.current = true;
        cameraRef.current.setCamera({
          centerCoordinate: coordsRef.current ?? undefined,
          heading,
          animationDuration: 150,
          animationMode: "easeTo",
        });
        setTimeout(() => { suppressResetRef.current = false; }, 250);
        bearingRef.current = heading;
        coneRotationAnim.setValue(0);
      }
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

  const suppressResetRef = useRef(false);

  const moveCamera = useCallback((fn: () => void, duration: number) => {
    suppressResetRef.current = true;
    fn();
    setTimeout(() => { suppressResetRef.current = false; }, duration + 100);
  }, []);

  // --- Compass mode ---
  const compassModeRef = useRef(CompassMode.Free);
  const [compassMode, setCompassModeState] = useState(CompassMode.Free);

  const setCompassMode = useCallback((mode: CompassMode) => {
    compassModeRef.current = mode;
    setCompassModeState(mode);
    if (mode === CompassMode.North) {
      moveCamera(() => cameraRef.current?.setCamera({ heading: 0, animationDuration: 400, animationMode: "easeTo" }), 400);
      bearingRef.current = 0;
      setBearing(0);
      if (userHeadingRef.current !== null) coneRotationAnim.setValue(userHeadingRef.current);
    }
  }, [moveCamera, coneRotationAnim]);

  const cycleCompassMode = useCallback(() => {
    setCompassMode((compassModeRef.current + 1) % 3 as CompassMode);
  }, [setCompassMode]);

  // --- Locate mode ---
  const locateModeRef = useRef(LocateMode.Free);
  const [locateFollowing, setLocateFollowing] = useState(false);

  const setLocateMode = useCallback((mode: LocateMode) => {
    locateModeRef.current = mode;
    setLocateFollowing(mode === LocateMode.Following);
  }, []);

  // Follow user position when locked
  useEffect(() => {
    if (!locateFollowing || !cameraRef.current || !coords) return;
    moveCamera(() => {
      cameraRef.current!.setCamera({ centerCoordinate: coords, animationDuration: 100, animationMode: "moveTo" });
    }, 100);
  }, [coords, locateFollowing, moveCamera]);

  const jumpToLocation = useCallback(() => {
    if (!cameraRef.current || !coords) return;
    switch (locateModeRef.current) {
      case LocateMode.Free:
        moveCamera(() => cameraRef.current!.flyTo(coords, 400), 400);
        setLocateMode(LocateMode.Centered);
        break;
      case LocateMode.Centered:
        moveCamera(() => cameraRef.current!.setCamera({ centerCoordinate: coords, zoomLevel: 16, animationDuration: 400, animationMode: "flyTo" }), 400);
        setLocateMode(LocateMode.Following);
        break;
      case LocateMode.Following:
        setLocateMode(LocateMode.Free);
        break;
    }
  }, [coords, setLocateMode, moveCamera]);

  const onRegionChanging = useCallback((feature?: { properties?: { isUserInteraction?: boolean; heading?: number } }) => {
    if (feature?.properties?.isUserInteraction && !suppressResetRef.current) {
      if (locateModeRef.current > LocateMode.Free) setLocateMode(LocateMode.Free);
      if (compassModeRef.current === CompassMode.Heading) setCompassMode(CompassMode.Free);
    }
    updateDotPosition(feature);
  }, [updateDotPosition, setLocateMode, setCompassMode]);

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
        rotateEnabled={compassMode === CompassMode.Free}
        onRegionIsChanging={onRegionChanging}
        onRegionDidChange={updateDotPosition}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={initialCoords ?? [0, 0]}
          animationMode="none"
        />
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
          <View style={[styles.cone, { borderBottomColor: invertColors ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)" }]} />
          {/* bottom half is empty — exists so container center aligns with dot */}
        </Animated.View>
      )}

      {dotScreenPos && (
        <View
          style={[
            styles.locationDot,
            { left: dotScreenPos.x - DOT_SIZE / 2, top: dotScreenPos.y - DOT_SIZE / 2 },
            { backgroundColor: invertColors ? "#000000" : "#ffffff" },
          ]}
          pointerEvents="none"
        />
      )}

      <View style={styles.buttonRow}>
        <HapticPressable onPress={cycleCompassMode}>
          <MaterialIcons
            name={compassMode === CompassMode.Heading ? "navigation" : "explore"}
            size={n(48)}
            color={invertColors ? "black" : "white"}
            style={{ transform: [{ rotate: compassMode === CompassMode.Free ? `${-bearing - 45}deg` : "-45deg" }] }}
          />
        </HapticPressable>
        {activeRoute && (
          <HapticPressable onPress={zoomToRoute}>
            <MaterialIcons name="route" size={n(48)} color={invertColors ? "black" : "white"} />
          </HapticPressable>
        )}
        <HapticPressable onPress={jumpToLocation}>
          <MaterialIcons name={locateFollowing ? "gps-fixed" : "gps-not-fixed"} size={n(48)} color={invertColors ? "black" : "white"} />
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
    elevation: 10,
  },
});
