import type { LayerSettings } from "@/contexts/MapLayersContext";

export type CoreLayers = {
  contours: LayerSettings;
  trails: LayerSettings;
  roads: LayerSettings;
  water: LayerSettings;
  labels: LayerSettings;
  route: LayerSettings;
};

export const editLayersState = {
  current: null as CoreLayers | null,
  pending: null as CoreLayers | null,
};
