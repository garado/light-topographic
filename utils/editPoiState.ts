import type { LayerSettings } from "@/contexts/MapLayersContext";

export type PoiLayers = {
  poiCamping: LayerSettings;
  poiParking: LayerSettings;
  poiViewpoints: LayerSettings;
  poiAmenities: LayerSettings;
  poiRestrooms: LayerSettings;
};

export const editPoiState = {
  current: null as PoiLayers | null,
  pending: null as PoiLayers | null,
};
