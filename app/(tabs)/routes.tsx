import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import ContentContainer from "@/components/ContentContainer";
import { Header } from "@/components/Header";
import { HapticPressable } from "@/components/HapticPressable";
import { StyledText } from "@/components/StyledText";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { useRoutes, type StoredRoute } from "@/contexts/RoutesContext";
import { parseGpx } from "@/utils/parseGpx";
import { n } from "@/utils/scaling";

function RouteRow({
  route,
  isActive,
  onPress,
  onDelete,
}: {
  route: StoredRoute;
  isActive: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { invertColors } = useInvertColors();

  return (
    <View style={styles.row}>
      <HapticPressable style={styles.rowContent} onPress={onPress}>
        <StyledText style={[styles.routeName, isActive && styles.active]}>
          {route.name}
        </StyledText>
      </HapticPressable>
      <HapticPressable onPress={onDelete} style={styles.deleteBtn}>
        <MaterialIcons
          name="close"
          size={n(20)}
          color={invertColors ? "black" : "white"}
          style={{ opacity: 0.4 }}
        />
      </HapticPressable>
    </View>
  );
}

export default function RoutesScreen() {
  const { routes, activeRouteId, addRoute, removeRoute, setActiveRouteId } = useRoutes();
  const { invertColors } = useInvertColors();
  const params = useLocalSearchParams<{ confirmed?: string; action?: string }>();

  useFocusEffect(
    useCallback(() => {
      if (params.confirmed === "true" && params.action?.startsWith("deleteRoute:")) {
        const id = params.action.slice("deleteRoute:".length);
        router.setParams({ confirmed: undefined, action: undefined });
        removeRoute(id);
      }
    }, [params.confirmed, params.action, removeRoute]),
  );

  const loadGpx = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/gpx+xml", "text/xml", "application/xml", "*/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;

    const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
    const parsed = parseGpx(content);
    if (!parsed) return;

    if (!parsed.name) {
      const filename = result.assets[0].name ?? "Unnamed Route";
      parsed.name = filename.replace(/\.gpx$/i, "");
    }

    addRoute(parsed);
  }, [addRoute]);

  const confirmDelete = useCallback((route: StoredRoute) => {
    router.push({
      pathname: "/confirm",
      params: {
        title: "Delete Route",
        message: `Delete "${route.name}"?\n\nIt will be removed from Topographic, but it will remain in the filesystem.`,
        confirmText: "Delete",
        action: `deleteRoute:${route.id}`,
        returnPath: "/(tabs)/routes",
      },
    });
  }, []);

  if (routes.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: invertColors ? "white" : "black" }]}>
        <Header
          headerTitle="Routes"
          hideBackButton
          rightAction={{ icon: "add", onPress: loadGpx }}
        />
        <View style={styles.emptyState}>
          <StyledText style={styles.emptyMessage}>No routes loaded</StyledText>
          <StyledText style={styles.emptyHint}>Tap + to add a GPX file</StyledText>
        </View>
      </View>
    );
  }

  return (
    <ContentContainer
      headerTitle="Routes"
      hideBackButton
      rightAction={{ icon: "add", onPress: loadGpx }}
    >
      <View style={styles.routeRow}>
        {routes.map((route) => (
          <RouteRow
            key={route.id}
            route={route}
            isActive={route.id === activeRouteId}
            onPress={() => setActiveRouteId(route.id === activeRouteId ? null : route.id)}
            onDelete={() => confirmDelete(route)}
          />
        ))}
      </View>
    </ContentContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: n(8),
  },
  emptyMessage: {
    fontSize: n(26),
    textAlign: "center",
  },
  emptyHint: {
    fontSize: n(16),
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: n(12),
    width: "100%",
  },
  rowContent: {
    flex: 1,
  },
  routeRow: {
    gap: n(26),
    paddingBottom: n(12),
  },
  routeName: {
    fontSize: n(26),
  },
  active: {
    textDecorationLine: "underline",
  },
  deleteBtn: {
    paddingTop: n(8)
  },
});
