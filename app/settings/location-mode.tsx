import { StyleSheet, View } from "react-native";
import ContentContainer from "@/components/ContentContainer";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { useLocationMode, type LocationMode } from "@/contexts/LocationModeContext";
import { n } from "@/utils/scaling";

const OPTIONS: { mode: LocationMode; name: string; description: string }[] = [
  {
    mode: "polling",
    name: "Polling",
    description:
      "GPS updates continuously in the background. The location dot always reflects your current position, and the map can follow you automatically. Uses more battery.",
  },
  {
    mode: "on-demand",
    name: "On-demand",
    description:
      "GPS only updates when you press the location button. The map flies to your position once, but does not follow you. Saves battery.",
  },
];

export default function LocationModeScreen() {
  const { locationMode, setLocationMode } = useLocationMode();

  return (
    <ContentContainer headerTitle="Location Mode" contentGap={32}>
      {OPTIONS.map(({ mode, name, description }) => (
        <HapticPressable key={mode} onPress={() => setLocationMode(mode)} style={styles.option}>
          <View style={styles.optionHeader}>
            <StyledText style={[styles.optionName, locationMode === mode && styles.selected]}>
              {name}
            </StyledText>
          </View>
          <StyledText style={styles.description}>{description}</StyledText>
        </HapticPressable>
      ))}
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  option: {
    gap: n(8),
    width: "100%",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: n(10),
  },
  optionName: {
    fontSize: n(30),
  },
  selected: {
    textDecorationLine: "underline",
  },
  description: {
    fontSize: n(16),
    opacity: 0.5,
    lineHeight: n(22),
  },
});
