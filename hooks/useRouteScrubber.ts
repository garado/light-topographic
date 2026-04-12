import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder } from "react-native";
import type { RefObject } from "react";
import type { StoredRoute } from "@/contexts/RoutesContext";
import { interpolateRoute, routeTotalMiles } from "@/utils/geo";
import { CompassMode, LocateMode } from "@/utils/mapModes";

export function useRouteScrubber({
  activeRoute,
  cameraRef,
  mapRef,
  setLocateMode,
  setCompassMode,
  compassModeRef,
  moveCamera,
}: {
  activeRoute: StoredRoute | null;
  cameraRef: RefObject<any>;
  mapRef: RefObject<any>;
  setLocateMode: (mode: LocateMode) => void;
  setCompassMode: (mode: CompassMode) => void;
  compassModeRef: React.MutableRefObject<CompassMode>;
  moveCamera: (fn: () => void, duration: number) => void;
}) {
  const [scrubVisible, setScrubVisible] = useState(false);
  const [scrubPos, setScrubPos] = useState(0);

  const scrubVisibleRef = useRef(false);
  scrubVisibleRef.current = scrubVisible;
  const scrubPosRef = useRef(0);
  const scrubHeightRef = useRef(1);
  const scrubStartPosRef = useRef(0);
  const scrubBoundsCheckRef = useRef(0);

  const scrubHandlerRef = useRef<(t: number) => void>(() => {});
  scrubHandlerRef.current = (t: number) => {
    scrubPosRef.current = t;
    setScrubPos(t);
    if (!activeRoute || !cameraRef.current || !mapRef.current) return;
    const coord = interpolateRoute(activeRoute.geojson.geometry.coordinates, t);
    const now = Date.now();
    if (now - scrubBoundsCheckRef.current < 250) return;
    scrubBoundsCheckRef.current = now;
    mapRef.current.getVisibleBounds().then(([[maxLng, maxLat], [minLng, minLat]]: [[number, number], [number, number]]) => {
      if (!scrubVisibleRef.current) return;
      if (coord[0] < minLng || coord[0] > maxLng || coord[1] < minLat || coord[1] > maxLat) {
        setLocateMode(LocateMode.Free);
        cameraRef.current?.flyTo(coord, 300);
      }
    });
  };

  const scrubPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      scrubStartPosRef.current = scrubPosRef.current;
    },
    onPanResponderMove: (_, gestureState) => {
      const t = Math.max(0, Math.min(1, scrubStartPosRef.current - gestureState.dy / scrubHeightRef.current));
      scrubHandlerRef.current(t);
    },
  })).current;

  const scrubCoord = useMemo(() => {
    if (!activeRoute || !scrubVisible) return null;
    return interpolateRoute(activeRoute.geojson.geometry.coordinates, scrubPos);
  }, [activeRoute, scrubPos, scrubVisible]);

  const routeMiles = useMemo(() => {
    if (!activeRoute) return 0;
    return routeTotalMiles(activeRoute.geojson.geometry.coordinates);
  }, [activeRoute]);

  useEffect(() => {
    setScrubPos(0);
    setScrubVisible(false);
    if (!activeRoute || !cameraRef.current) return;
    cameraRef.current.fitBounds(
      [activeRoute.bounds[2], activeRoute.bounds[3]],
      [activeRoute.bounds[0], activeRoute.bounds[1]],
      50,
      600,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoute]);

  const zoomToRoute = useCallback(() => {
    if (!activeRoute || !cameraRef.current) return;
    setLocateMode(LocateMode.Free);
    if (compassModeRef.current === CompassMode.Heading) setCompassMode(CompassMode.Free);
    moveCamera(() => cameraRef.current!.fitBounds(
      [activeRoute.bounds[2], activeRoute.bounds[3]],
      [activeRoute.bounds[0], activeRoute.bounds[1]],
      50,
      600,
    ), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoute, setLocateMode, setCompassMode]);

  return {
    scrubVisible,
    setScrubVisible,
    scrubVisibleRef,
    scrubPos,
    scrubCoord,
    routeMiles,
    scrubHeightRef,
    scrubPan,
    zoomToRoute,
  };
}
