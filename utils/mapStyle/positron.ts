import type { Palette } from "./types";

/** Positron palette — colors sourced from openmaptiles/positron-gl-style. */
export const positron: Palette = {
  background:        "#f2f3f0",
  landcover:         "#dce0dc",
  landuse:           "#eaeae6",
  park:              "#e6e9e5",
  labels:            "#758191",
  labelHalo:         "#f2f3f0",
  peak:              "#758191",
  textHalo:          "#f2f3f0",
  contours:          "#aaaaaa",
  contourIndex:      "#888888",
  trails:            "#999999",
  trailLabel:        "#777777",
  waterFill:         "#c2c8ca",
  waterway:          "#bdcbd0",
  roads: {
    minor:  "#e0e0e0",
    medium: "#ffffff",
    major:  "#ffffff",
  },
  poiCamping:        "#777777",
  poiParking:        "#888888",
  poiViewpoint:      "#758191",
  poiAmenity:        "#888888",
  poiRestrooms:      "#888888",
  poiTransportation: "#777777",
};
