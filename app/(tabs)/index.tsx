/**
 * @file index.tsx
 * @description The main map view.
 */

import MapLibreGL from "@maplibre/maplibre-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Animated, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { n } from "@/utils/scaling";
import { buildMapStyle } from "@/utils/mapStyle";
import { useMapLayers } from "@/contexts/MapLayersContext";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useMarkers } from "@/contexts/MarkersContext";
import { useRoutes } from "@/contexts/RoutesContext";
import { useUnits } from "@/contexts/UnitsContext";
import { mapFocusState } from "@/utils/mapFocusState";
import { newMarkerState } from "@/utils/newMarkerState";
import { scaleBarInfo } from "@/utils/geo";
import { useColor } from "@/hooks/useColor";
import { useLocationMode } from "@/contexts/LocationModeContext";
import { useLocation } from "@/hooks/useLocation";
import { useCompass } from "@/hooks/useCompass";
import { useRouteScrubber } from "@/hooks/useRouteScrubber";
import { RouteScrubberView } from "@/components/RouteScrubberView";
import { CompassMode, LocateMode } from "@/utils/mapModes";
MapLibreGL.setAccessToken("pk.placeholder");

const DOT_SIZE = 12;
const CONE_HEIGHT = DOT_SIZE * 1.5;
const CONE_HALF_WIDTH = DOT_SIZE / 2;
const DEFAULT_COORDS = [40.6975, -73.9734];

export default function MapScreen() {
  useColor();
  const { layers } = useMapLayers();
  const { invertColors } = useInvertColors();
  const { locationMode } = useLocationMode();
  const MAP_STYLE = useMemo(() => buildMapStyle(layers, invertColors), [layers, invertColors]);
  const { activeRoute } = useRoutes();
  const { units } = useUnits();
  const { markers } = useMarkers();

  const mapRef = useRef<MapLibreGL.MapView>(null);
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const bearingRef = useRef(0);
  const coordsRef = useRef<[number, number] | null>(null);
  const suppressResetRef = useRef(false);
  const [zoom, setZoom] = useState(13);
  const markersRef = useRef(markers);
  markersRef.current = markers;
  const [dotScreenPos, setDotScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [markerScreenPositions, setMarkerScreenPositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => { MapLibreGL.offlineManager.setTileCountLimit(5000); }, []);

  const moveCamera = useCallback((fn: () => void, duration: number) => {
    suppressResetRef.current = true;
    fn();
    setTimeout(() => { suppressResetRef.current = false; }, duration + 100);
  }, []);

  const {
    coords, lastFixLabel, locateFollowing,
    locateModeRef, lockBearingRef, setLocateMode, jumpToLocation,
  } = useLocation({ locationMode, cameraRef, coordsRef, bearingRef, moveCamera });

  const {
    hasHeading, bearing, setBearing, compassMode, compassModeRef,
    userHeadingRef, coneRotationAnim, setCompassMode, cycleCompassMode,
  } = useCompass({ cameraRef, coordsRef, bearingRef, suppressResetRef, moveCamera, setLocateMode });

  const {
    scrubVisible, setScrubVisible, scrubVisibleRef, scrubPos,
    scrubCoord, routeMiles, scrubHeightRef, scrubPan, zoomToRoute,
  } = useRouteScrubber({ activeRoute, cameraRef, mapRef, setLocateMode, setCompassMode, compassModeRef, moveCamera });

  useFocusEffect(useCallback(() => {
    if (mapFocusState.flyTo && cameraRef.current) {
      setLocateMode(LocateMode.Free);
      cameraRef.current.flyTo(mapFocusState.flyTo, 400);
      mapFocusState.flyTo = null;
    }
  }, [setLocateMode]));

  const updateDotPosition = useCallback(async (feature?: { properties?: { heading?: number; zoomLevel?: number } }) => {
    if (feature?.properties?.heading !== undefined) {
      bearingRef.current = feature.properties.heading;
      setBearing(feature.properties.heading);
      if (userHeadingRef.current !== null) {
        coneRotationAnim.setValue(userHeadingRef.current - feature.properties.heading);
      }
    }
    if (feature?.properties?.zoomLevel !== undefined) setZoom(feature.properties.zoomLevel);
    if (!mapRef.current) return;
    if (coords) {
      const point = await mapRef.current.getPointInView(coords);
      setDotScreenPos({ x: point[0], y: point[1] });
    }
    const currentMarkers = markersRef.current;
    if (currentMarkers.length > 0 && mapRef.current) {
      const entries = await Promise.all(
        currentMarkers.map(async (m) => {
          const point = await mapRef.current!.getPointInView(m.coords);
          return [m.id, { x: point[0], y: point[1] }] as const;
        }),
      );
      setMarkerScreenPositions(Object.fromEntries(entries));
    } else {
      setMarkerScreenPositions({});
    }
  }, [coords, setBearing, userHeadingRef, coneRotationAnim]);

  useEffect(() => { updateDotPosition(); }, [updateDotPosition]);

  const onRegionChanging = useCallback((feature?: {
    geometry?: { coordinates?: [number, number] };
    properties?: { isUserInteraction?: boolean; heading?: number; zoomLevel?: number };
  }) => {
    if (feature?.properties?.isUserInteraction && !suppressResetRef.current) {
      if (scrubVisibleRef.current) {
        scrubVisibleRef.current = false;
        setScrubVisible(false);
      }
      if (locateModeRef.current === LocateMode.Following) {
        const center = feature.geometry?.coordinates;
        const user = coordsRef.current;
        const currentBearing = feature.properties?.heading ?? bearingRef.current;
        const zoomLevel = feature.properties?.zoomLevel ?? 16;

        if (center && user) {
          const dist = Math.abs(center[0] - user[0]) + Math.abs(center[1] - user[1]);
          if (dist > 0.0001) { setLocateMode(LocateMode.Free); return; }
        }

        let bearingDiff = Math.abs(currentBearing - lockBearingRef.current);
        if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;
        if (bearingDiff > 50) {
          setLocateMode(LocateMode.Free); return;
        } else if (bearingDiff > 0) {
          suppressResetRef.current = true;
          cameraRef.current?.setCamera({ heading: lockBearingRef.current, animationDuration: 0, animationMode: "none" });
          setTimeout(() => { suppressResetRef.current = false; }, 50);
        }

        if (zoomLevel < 12) { setLocateMode(LocateMode.Free); return; }
      } else if (locateModeRef.current > LocateMode.Free) {
        setLocateMode(LocateMode.Free);
      }
      if (compassModeRef.current === CompassMode.North || compassModeRef.current === CompassMode.Heading) {
        setCompassMode(CompassMode.Free);
      }
    }
    updateDotPosition(feature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateDotPosition, setLocateMode, setCompassMode, setScrubVisible]);

  const coneRotateStyle = {
    transform: [{
      rotate: coneRotationAnim.interpolate({
        inputRange: [-720, 720],
        outputRange: ["-720deg", "720deg"],
        extrapolate: "extend",
      }),
    }],
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
        rotateEnabled={compassMode !== CompassMode.Heading}
        onRegionIsChanging={onRegionChanging}
        onRegionDidChange={updateDotPosition}
        onLongPress={(e: any) => {
          const coords = e.geometry?.coordinates as [number, number] | undefined;
          if (!coords) return;
          newMarkerState.coords = coords;
          router.push("/marker/new");
        }}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={DEFAULT_COORDS}
          animationMode="none"
        />
        {activeRoute && layers.route.visible && (() => {
          const routeColor = layers.route.color ? "#ebcb8b" : "#ffffff";
          const coords = activeRoute.geojson.geometry.coordinates;
          return (
            <>
              <MapLibreGL.ShapeSource id="route" shape={activeRoute.geojson}>
                <MapLibreGL.LineLayer
                  id="route-line"
                  style={{ lineColor: routeColor, lineWidth: 2, lineOpacity: 0.9 }}
                />
              </MapLibreGL.ShapeSource>
              <MapLibreGL.ShapeSource id="route-arrows-src" shape={activeRoute.geojson}>
                <MapLibreGL.SymbolLayer
                  id="route-arrows"
                  style={{
                    symbolPlacement: "line",
                    symbolSpacing: 60,
                    textField: ">",
                    textFont: ["Noto Sans Regular"],
                    textSize: n(20),
                    textColor: routeColor,
                    textRotationAlignment: "map",
                    textKeepUpright: false,
                    textOpacity: 0.9,
                  }}
                />
              </MapLibreGL.ShapeSource>
              <MapLibreGL.ShapeSource
                id="route-markers"
                shape={{
                  type: "FeatureCollection",
                  features: [
                    { type: "Feature", geometry: { type: "Point", coordinates: coords[0] }, properties: { marker: "start" } },
                    { type: "Feature", geometry: { type: "Point", coordinates: coords[coords.length - 1] }, properties: { marker: "end" } },
                  ],
                }}
              >
                <MapLibreGL.CircleLayer
                  id="route-marker-start"
                  filter={["==", ["get", "marker"], "start"]}
                  style={{ circleRadius: 4, circleColor: routeColor, circleStrokeWidth: 1.4, circleStrokeColor: "black" }}
                />
                <MapLibreGL.CircleLayer
                  id="route-marker-end"
                  filter={["==", ["get", "marker"], "end"]}
                  style={{ circleRadius: 4, circleColor: "transparent", circleStrokeWidth: 3, circleStrokeColor: routeColor }}
                />
              </MapLibreGL.ShapeSource>
            </>
          );
        })()}
        {scrubCoord && (
          <MapLibreGL.ShapeSource
            id="scrub-dot"
            shape={{ type: "Feature", geometry: { type: "Point", coordinates: scrubCoord }, properties: {} }}
          >
            <MapLibreGL.CircleLayer
              id="scrub-dot-circle"
              style={{ circleRadius: 6, circleColor: invertColors ? "black" : "white", circleStrokeWidth: 2, circleStrokeColor: invertColors ? "white" : "black" }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {dotScreenPos && hasHeading && (
        <Animated.View
          style={[
            styles.coneContainer,
            { left: dotScreenPos.x - CONE_HALF_WIDTH, top: dotScreenPos.y - CONE_HEIGHT },
            coneRotateStyle,
          ]}
          pointerEvents="none"
        >
          <View style={[styles.cone, { borderBottomColor: invertColors ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)" }]} />
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

      {Object.entries(markerScreenPositions).map(([id, pos]) => (
        <MaterialIcons
          key={id}
          name="place"
          size={n(28)}
          color={invertColors ? "black" : "white"}
          style={[styles.markerPin, { left: pos.x - n(14), top: pos.y - n(28) }]}
          pointerEvents="none"
        />
      ))}

      {(() => {
        const lat = coords?.[1] ?? 0;
        const { widthPx, label } = scaleBarInfo(zoom, lat, units);
        const barColor = invertColors ? "black" : "white";
        return (
          <View style={[styles.scaleBar, { width: widthPx }]}>
            <StyledText style={styles.scaleBarLabel}>{label}</StyledText>
            <View style={[styles.scaleBarLine, { borderColor: barColor }]} />
          </View>
        );
      })()}

      <StyledText style={styles.lastFix}>Last fix: {lastFixLabel}</StyledText>

      {activeRoute && scrubVisible && (
        <RouteScrubberView
          scrubPos={scrubPos}
          scrubHeightRef={scrubHeightRef}
          scrubPan={scrubPan}
          routeMiles={routeMiles}
          units={units}
          invertColors={invertColors}
        />
      )}

      <View style={styles.buttonRow}>
        {activeRoute && (
          <HapticPressable onPress={zoomToRoute} onLongPress={() => setScrubVisible((v) => !v)}>
            <MaterialIcons name="route" size={n(48)} color={invertColors ? "black" : "white"} />
          </HapticPressable>
        )}
        <HapticPressable onPress={cycleCompassMode}>
          <MaterialIcons
            name={compassMode === CompassMode.Heading ? "navigation" : "explore"}
            size={n(48)}
            color={invertColors ? "black" : "white"}
            style={{ transform: [{ rotate: compassMode === CompassMode.Free ? `${-bearing - 45}deg` : "-45deg" }] }}
          />
        </HapticPressable>
        <HapticPressable onPress={jumpToLocation}>
          <MaterialIcons
            name={locationMode === "on-demand" ? "gps-not-fixed" : (locateFollowing ? "gps-fixed" : "gps-not-fixed")}
            size={n(48)}
            color={invertColors ? "black" : "white"}
          />
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coneContainer: {
    position: "absolute",
    width: CONE_HALF_WIDTH * 2,
    height: CONE_HEIGHT * 2,
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
  markerPin: {
    position: "absolute",
  },
  scaleBar: {
    position: "absolute",
    top: n(6),
    left: n(6),
  },
  scaleBarLabel: {
    fontSize: n(12),
    textAlign: "left",
  },
  scaleBarLine: {
    height: n(5),
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
  },
  lastFix: {
    position: "absolute",
    bottom: n(6),
    left: n(4),
    textAlign: "left",
    fontSize: n(12),
  },
  buttonRow: {
    position: "absolute",
    bottom: n(6),
    right: n(6),
    flexDirection: "row",
    gap: n(20),
    alignItems: "center",
    elevation: 10,
  },
});
