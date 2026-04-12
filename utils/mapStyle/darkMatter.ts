import type { Palette } from "./types";

/** Dark Matter palette — colors sourced from openmaptiles/dark-matter-gl-style. */
export const darkMatter: Palette = {
  background:        "#0c0c0c",
  landcover:         "#202020",
  landuse:           "#0d0c0c",
  park:              "#202020",
  labels:            "#656565",
  labelHalo:         "#000000",
  peak:              "#656565",
  textHalo:          "#000000",
  contours:          "#e0e0e0",
  contourIndex:      "#f0f0f0",
  trails:            "#8a8a8a",
  trailLabel:        "#aaaaaa",
  waterFill:         "#1b1b1d",
  waterway:          "#1b1b1d",
  roads: {
    minor:  "#181818",
    medium: "#252525",
    major:  "#333333",
  },
  poiCamping:        "#888888",
  poiParking:        "#777777",
  poiViewpoint:      "#656565",
  poiAmenity:        "#666666",
  poiRestrooms:      "#666666",
  poiTransportation: "#888888",
};
