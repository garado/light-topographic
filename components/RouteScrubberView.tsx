import { StyleSheet, View } from "react-native";
import type { MutableRefObject } from "react";
import type { PanResponderInstance } from "react-native";
import { StyledText } from "@/components/StyledText";
import { n } from "@/utils/scaling";

const SCRUB_THUMB = 12;

interface Props {
  scrubPos: number;
  scrubHeightRef: MutableRefObject<number>;
  scrubPan: PanResponderInstance;
  routeMiles: number;
  units: "imperial" | "metric";
  invertColors: boolean;
}

export function RouteScrubberView({ scrubPos, scrubHeightRef, scrubPan, routeMiles, units, invertColors }: Props) {
  const remaining = units === "imperial"
    ? `${(routeMiles * (1 - scrubPos)).toFixed(1)} mi`
    : `${(routeMiles * 1.60934 * (1 - scrubPos)).toFixed(1)} km`;

  return (
    <>
      <StyledText style={styles.label}>{remaining} remaining</StyledText>
      <View
        style={styles.scrubber}
        onLayout={(e) => { scrubHeightRef.current = e.nativeEvent.layout.height; }}
        {...scrubPan.panHandlers}
      >
        <View style={[styles.track, { backgroundColor: invertColors ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)" }]}>
          <View style={[styles.fill, { height: `${scrubPos * 100}%`, backgroundColor: invertColors ? "black" : "white" }]} />
        </View>
        <View style={[styles.thumb, { top: (1 - scrubPos) * (scrubHeightRef.current - SCRUB_THUMB), backgroundColor: invertColors ? "black" : "white" }]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    left: n(4),
    bottom: n(20),
    fontSize: n(16),
  },
  scrubber: {
    position: "absolute",
    right: n(4),
    top: n(80),
    bottom: n(100),
    width: n(24),
    alignItems: "center",
  },
  track: {
    flex: 1,
    width: 2,
    borderRadius: 1,
  },
  fill: {
    position: "absolute",
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  thumb: {
    position: "absolute",
    width: SCRUB_THUMB,
    height: SCRUB_THUMB,
    borderRadius: SCRUB_THUMB / 2,
    left: (n(24) - SCRUB_THUMB) / 2,
  },
});
