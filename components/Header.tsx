import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";
import { HapticPressable } from "./HapticPressable";
import { StyledText } from "./StyledText";

interface RightAction {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  show?: boolean;
  active?: boolean;
}

interface HeaderProps {
  headerTitle?: string;
  hideBackButton?: boolean;
  rightAction?: RightAction;
  rightActions?: RightAction[];
}

export function Header({
  headerTitle,
  hideBackButton = false,
  rightAction,
  rightActions,
}: HeaderProps) {
  const actions = rightActions ?? (rightAction ? [rightAction] : []);
  const { invertColors } = useInvertColors();
  const iconColor = invertColors ? "black" : "white";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: invertColors ? "white" : "black" },
      ]}
    >
      {hideBackButton ? (
        <View style={styles.button} />
      ) : (
        <HapticPressable onPress={handleBack}>
          <View style={styles.button}>
            <MaterialIcons
              color={iconColor}
              name="arrow-back-ios"
              size={n(28)}
            />
          </View>
        </HapticPressable>
      )}
      <View pointerEvents="none" style={styles.title}>
        <StyledText numberOfLines={1} style={styles.title} pointerEvents="none">
          {headerTitle}
        </StyledText>
      </View>
      {actions.length > 0 ? (
        <View style={styles.rightActions}>
          {actions.filter((a) => a.show !== false).map((a) => (
            <HapticPressable key={a.icon} onPress={a.onPress}>
              <View style={styles.button}>
                <MaterialIcons
                  color={iconColor}
                  name={a.icon}
                  size={n(28)}
                  style={{ opacity: a.active === false ? 0.4 : 1 }}
                />
              </View>
            </HapticPressable>
          ))}
        </View>
      ) : (
        <View style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: n(22),
    paddingVertical: n(5),
    zIndex: 1,
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: n(20),
    fontFamily: "PublicSans-Regular",
    paddingTop: n(2),
  },
  button: {
    width: n(32),
    height: n(32),
    alignItems: "center",
    paddingTop: n(6),
    paddingRight: n(4),
  },
  rightActions: {
    flexDirection: "row",
    gap: n(4),
  },
});
