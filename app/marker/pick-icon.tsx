import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { HapticPressable } from "@/components/HapticPressable";
import { SwipeBackContainer } from "@/components/SwipeBackContainer";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { MARKER_ICONS } from "@/utils/markerIcons";
import { pickIconState } from "@/utils/pickIconState";
import { n } from "@/utils/scaling";

export default function PickIconScreen() {
  const { invertColors } = useInvertColors();
  const fg = invertColors ? "black" : "white";
  const bg = invertColors ? "white" : "black";

  const handleSelect = (key: string) => {
    pickIconState.pendingIcon = key;
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <Header headerTitle="Icon" />
      <SwipeBackContainer onSwipeBack={() => router.back()}>
        <View style={styles.grid}>
          {MARKER_ICONS.map(({ key }) => (
            <HapticPressable key={key} onPress={() => handleSelect(key)} style={styles.item}>
              <MaterialIcons name={key as any} size={n(40)} color={fg} />
            </HapticPressable>
          ))}
        </View>
      </SwipeBackContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    alignContent: "center",
    gap: n(32),
    paddingHorizontal: n(20),
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
  },
});
