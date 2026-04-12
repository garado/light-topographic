import type { Palette } from "./types";

/** Colored overrides applied when a layer has color enabled (dark context). */
export const coloredDark: Palette = {
  background:        "#000000",
  landcover:         "#0d0d0d",
  landuse:           "#141414",
  park:              "#161616",
  labels:            "#ffffff",
  labelHalo:         "#000000",
  peak:              "#cccccc",
  textHalo:          "#0d0d0d",
  contours:          "#c87941",
  contourIndex:      "#a05020",
  trails:            "#a3be8c",
  trailLabel:        "#aaaaaa",
  waterFill:         "#5e81ac",
  waterway:          "#5e81ac",
  roads: {
    minor:  "#262626",
    medium: "#313131",
    major:  "#424242",
  },
  poiCamping:        "#a3be8c",
  poiParking:        "#81a1c1",
  poiViewpoint:      "#d08770",
  poiAmenity:        "#ebcb8b",
  poiRestrooms:      "#b48ead",
  poiTransportation: "#88c0d0",
};

/** Colored overrides applied when a layer has color enabled (light context). */
export const coloredLight: Palette = {
  background:        "#ffffff",
  landcover:         "#f0f0f0",
  landuse:           "#e8e8e8",
  park:              "#e4ede4",
  labels:            "#111111",
  labelHalo:         "#ffffff",
  peak:              "#333333",
  textHalo:          "#ffffff",
  contours:          "#c87941",
  contourIndex:      "#a05020",
  trails:            "#a3be8c",
  trailLabel:        "#666666",
  waterFill:         "#5e81ac",
  waterway:          "#5e81ac",
  roads: {
    minor:  "#cccccc",
    medium: "#bbbbbb",
    major:  "#aaaaaa",
  },
  poiCamping:        "#4a7a4a",
  poiParking:        "#2e6096",
  poiViewpoint:      "#a04020",
  poiAmenity:        "#8b6914",
  poiRestrooms:      "#7a4a7a",
  poiTransportation: "#2e6a7a",
};
