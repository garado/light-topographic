import MapLibreGL from "@maplibre/maplibre-react-native";
import { File, Paths } from "expo-file-system/next";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useColor } from "@/hooks/useColor";
import { confirmState } from "@/utils/confirmState";
import { tileCacheSizeState } from "@/utils/tileCacheSizeState";

const DEFAULT_CACHE_MB = 500;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MapTileCacheScreen() {
  const [cacheMb, setCacheMb] = usePersistedState<number>("tileCacheMb", DEFAULT_CACHE_MB);
  const [cacheUsed, setCacheUsed] = useState<string>("...");

  useFocusEffect(
    useCallback(() => {
      if (tileCacheSizeState.pendingMb !== null) {
        const mb = tileCacheSizeState.pendingMb;
        tileCacheSizeState.pendingMb = null;
        setCacheMb(mb);
        MapLibreGL.offlineManager.setMaximumAmbientCacheSize(mb * 1024 * 1024);
      }

      if (confirmState.pendingAction === "clearCache") {
        confirmState.pendingAction = null;
        MapLibreGL.offlineManager.clearAmbientCache().then(() => {
          const cacheDb = new File(Paths.document, "mbgl-offline.db");
          setCacheUsed(cacheDb.exists ? formatBytes(cacheDb.size) : "0 KB");
        });
        return;
      }

      const cacheDb = new File(Paths.document, "mbgl-offline.db");
      setCacheUsed(cacheDb.exists ? formatBytes(cacheDb.size) : "0 KB");
    }, [setCacheMb]),
  );

  return (
    <ContentContainer headerTitle="Map Tile Cache" contentGap={32}>
      <SelectorButton
        label="Maximum Cache Size"
        value={`${cacheMb} MB`}
        href={{ pathname: "/settings/tile-cache-size", params: { currentMb: cacheMb } }}
      />
      <SelectorButton
        label="Current Cache Size"
        value={cacheUsed}
        onPress={() => { }}
      />
      <StyledButton
        onPress={() => router.push("/settings/cached-tiles")}
        text="View Cached Tiles"
      />
      <StyledButton
        onPress={() => router.push({
          pathname: "/confirm",
          params: {
            title: "Clear Cache",
            message: "This will delete all cached map tiles. You will need to redownload them over a network connection.\n\nThis is not recommended if you are out and have no cell service.",
            confirmText: "Clear",
            action: "clearCache",
            returnPath: "/settings/map-tile-cache",
          },
        })}
        text="Clear Cache"
      />
    </ContentContainer>
  );
}
