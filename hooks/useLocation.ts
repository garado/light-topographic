import Geolocation from "@react-native-community/geolocation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PermissionsAndroid } from "react-native";
import type { MutableRefObject, RefObject } from "react";
import type { LocationMode } from "@/contexts/LocationModeContext";
import { LocateMode } from "@/utils/mapModes";

export function useLocation({
  locationMode,
  cameraRef,
  coordsRef,
  bearingRef,
  moveCamera,
}: {
  locationMode: LocationMode;
  cameraRef: RefObject<any>;
  coordsRef: MutableRefObject<[number, number] | null>;
  bearingRef: MutableRefObject<number>;
  moveCamera: (fn: () => void, duration: number) => void;
}) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [initialCoords, setInitialCoords] = useState<[number, number] | null>(null);
  const [lastFixTime, setLastFixTime] = useState<number | null>(null);
  const [lastFixLabel, setLastFixLabel] = useState("∞");
  const [locateFollowing, setLocateFollowing] = useState(false);

  const locateModeRef = useRef(LocateMode.Free);
  const lockBearingRef = useRef(0);

  useEffect(() => {
    if (locationMode !== "polling") return;
    let watchId: number | null = null;
    (async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      watchId = Geolocation.watchPosition(
        (pos) => {
          const c: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setCoords(c);
          setLastFixTime(Date.now());
          coordsRef.current = c;
          setInitialCoords((prev) => prev ?? c);
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true, distanceFilter: 0 },
      );
    })();
    return () => { if (watchId != null) Geolocation.clearWatch(watchId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationMode]);

  useEffect(() => {
    if (lastFixTime == null) return;
    const fmt = () => {
      const sec = Math.floor((Date.now() - lastFixTime) / 1000);
      setLastFixLabel(sec < 60 ? "<1m ago" : `${Math.floor(sec / 60)}m ago`);
    };
    fmt();
    const id = setInterval(fmt, 5000);
    return () => clearInterval(id);
  }, [lastFixTime]);

  useEffect(() => {
    if (!locateFollowing || !cameraRef.current || !coords) return;
    moveCamera(() => {
      cameraRef.current!.setCamera({ centerCoordinate: coords, animationDuration: 100, animationMode: "moveTo" });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, locateFollowing]);

  const setLocateMode = useCallback((mode: LocateMode) => {
    locateModeRef.current = mode;
    setLocateFollowing(mode === LocateMode.Following);
    if (mode === LocateMode.Following) lockBearingRef.current = bearingRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jumpToLocation = useCallback(() => {
    if (!cameraRef.current) return;

    if (locationMode === "on-demand") {
      Geolocation.getCurrentPosition(
        (pos) => {
          const c: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setCoords(c);
          setLastFixTime(Date.now());
          coordsRef.current = c;
          setInitialCoords((prev) => prev ?? c);
          cameraRef.current?.flyTo(c, 400);
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true, timeout: 10000 },
      );
      return;
    }

    if (!coords) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, locationMode, setLocateMode]);

  return {
    coords,
    initialCoords,
    lastFixLabel,
    locateFollowing,
    locateModeRef,
    lockBearingRef,
    setLocateMode,
    jumpToLocation,
  };
}
