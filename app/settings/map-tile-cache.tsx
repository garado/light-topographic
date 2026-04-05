import MapLibreGL from "@maplibre/maplibre-react-native";
import { File, Paths } from "expo-file-system/next";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import ContentContainer from "@/components/ContentContainer";
import { SelectorButton } from "@/components/SelectorButton";
import { StyledButton } from "@/components/StyledButton";
import { usePersistedState } from "@/hooks/usePersistedState";
import { tileCacheSizeState } from "@/utils/tileCacheSizeState";

const DEFAULT_CACHE_MB = 500;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MapTileCacheScreen() {
  const [cacheMb, setCacheMb] = usePersistedState<number>("tileCacheMb", DEFAULT_CACHE_MB);
  const [cacheUsed, setCacheUsed] = useState<string>("...");

  useEffect(() => {
    MapLibreGL.offlineManager.setMaximumAmbientCacheSize(cacheMb * 1024 * 1024);
  }, [cacheMb]);

  useFocusEffect(
    useCallback(() => {
      if (tileCacheSizeState.pendingMb !== null) {
        setCacheMb(tileCacheSizeState.pendingMb);
        tileCacheSizeState.pendingMb = null;
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
        onPress={() => {}}
      />
      <StyledButton
        onPress={() => router.push("/settings/cached-tiles")}
        text="View Cached Tiles"
      />
    </ContentContainer>
  );
}
