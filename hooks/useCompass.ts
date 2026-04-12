import CompassHeading from "react-native-compass-heading";
import { Animated } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject, RefObject } from "react";
import { CompassMode, LocateMode } from "@/utils/mapModes";

export function useCompass({
  cameraRef,
  coordsRef,
  bearingRef,
  suppressResetRef,
  moveCamera,
  setLocateMode,
}: {
  cameraRef: RefObject<any>;
  coordsRef: MutableRefObject<[number, number] | null>;
  bearingRef: MutableRefObject<number>;
  suppressResetRef: MutableRefObject<boolean>;
  moveCamera: (fn: () => void, duration: number) => void;
  setLocateMode: (mode: LocateMode) => void;
}) {
  const [hasHeading, setHasHeading] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [compassMode, setCompassModeState] = useState(CompassMode.Free);

  const compassModeRef = useRef(CompassMode.Free);
  const userHeadingRef = useRef<number | null>(null);
  const coneRotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    return () => { CompassHeading.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCompassMode = useCallback((mode: CompassMode) => {
    compassModeRef.current = mode;
    setCompassModeState(mode);
    if (mode === CompassMode.North) {
      moveCamera(() => cameraRef.current?.setCamera({ heading: 0, animationDuration: 400, animationMode: "easeTo" }), 400);
      bearingRef.current = 0;
      setBearing(0);
      if (userHeadingRef.current !== null) coneRotationAnim.setValue(userHeadingRef.current);
    } else if (mode === CompassMode.Heading) {
      setLocateMode(LocateMode.Following);
      if (userHeadingRef.current !== null && cameraRef.current) {
        const heading = userHeadingRef.current;
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLocateMode]);

  const cycleCompassMode = useCallback(() => {
    setCompassMode((compassModeRef.current + 1) % 3 as CompassMode);
  }, [setCompassMode]);

  return {
    hasHeading,
    bearing,
    setBearing,
    compassMode,
    compassModeRef,
    userHeadingRef,
    coneRotationAnim,
    setCompassMode,
    cycleCompassMode,
  };
}
