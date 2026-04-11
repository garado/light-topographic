import { MaterialIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StackActions } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";
import { HapticPressable } from "./HapticPressable";

export interface TabConfigItem {
  iconName: keyof typeof MaterialIcons.glyphMap;
  name: string;
  screenName: string;
}

interface NavbarProps {
  currentScreenName: string;
  navigation: BottomTabBarProps["navigation"];
  tabsConfig?: readonly TabConfigItem[];
}

const getTabColor = (isActive: boolean, inverted: boolean) => {
  if (isActive) {
    return inverted ? "black" : "white";
  }
  return inverted ? "#C1C1C1" : "#6E6E6E";
};

export function Navbar({
  tabsConfig,
  currentScreenName,
  navigation,
}: NavbarProps) {
  const { invertColors } = useInvertColors();

  return (
    <View
      style={[
        styles.navbar,
        { backgroundColor: invertColors ? "white" : "black" },
      ]}
    >
      {tabsConfig?.map((tab) => (
        <HapticPressable
          key={tab.screenName}
          onPress={() => {
            const parent = navigation.getParent();
            if (parent?.canGoBack()) {
              parent.dispatch(StackActions.popToTop());
            }
            navigation.navigate(tab.screenName);
          }}
        >
          <MaterialIcons
            color={getTabColor(
              tab.screenName === currentScreenName,
              invertColors
            )}
            hitSlop={{ left: 50, right: 50 }}
            name={tab.iconName}
            size={n(35)}
          />
        </HapticPressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: n(11),
    paddingHorizontal: n(20),
  },
});
