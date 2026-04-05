import type { MapLayers } from "@/contexts/MapLayersContext";

const TILE_BASE = "https://tiles.openstreetmap.us/vector";

export function buildMapStyle(layers: MapLayers, invertColors = false, offlineOnly = false) {
  const tileUrl = (path: string) =>
    offlineOnly ? `http://localhost:0/${path}/{z}/{x}/{y}` : `${TILE_BASE}/${path}/{z}/{x}/{y}.mvt`;
  const vis = (key: keyof MapLayers) =>
    ({ visibility: layers[key].visible ? "visible" : "none" } as const);

  const dark = !invertColors;
  const colored = (key: keyof MapLayers) => layers[key].color;

  const palette = {
    background:   { grayscale: { dark: "#000000", light: "#ffffff" }, colored: { dark: "#000000", light: "#ffffff" } },
    landcover:    { grayscale: { dark: "#0d0d0d",  light: "#f0f0f0" }, colored: { dark: "#0d0d0d",  light: "#f0f0f0" } },
    landuse:      { grayscale: { dark: "#141414",  light: "#e8e8e8" }, colored: { dark: "#141414",  light: "#e8e8e8" } },
    park:         { grayscale: { dark: "#161616",  light: "#eeeeee" }, colored: { dark: "#161616",  light: "#e4ede4" } },
    labels:       { grayscale: { dark: "#ffffff",  light: "#111111" }, colored: { dark: "#ffffff",  light: "#111111" } },
    labelHalo:    { grayscale: { dark: "#000000",  light: "#ffffff" }, colored: { dark: "#000000",  light: "#ffffff" } },
    peak:         { grayscale: { dark: "#cccccc",  light: "#333333" }, colored: { dark: "#cccccc",  light: "#333333" } },
    textHalo:     { grayscale: { dark: "#0d0d0d",  light: "#ffffff" }, colored: { dark: "#0d0d0d",  light: "#ffffff" } },
    contours:     { grayscale: { dark: "#ffffff",  light: "#777777" }, colored: { dark: "#c87941",  light: "#c87941" } },
    contourIndex: { grayscale: { dark: "#ffffff",  light: "#555555" }, colored: { dark: "#a05020",  light: "#a05020" } },
    trails:       { grayscale: { dark: "#888888",  light: "#777777" }, colored: { dark: "#a3be8c",  light: "#a3be8c" } },
    trailLabel:   { grayscale: { dark: "#aaaaaa",  light: "#666666" }, colored: { dark: "#aaaaaa",  light: "#666666" } },
    waterFill:    { grayscale: { dark: "#262626",  light:   "#dddddd" }, colored: { dark: "#5e81ac",  light: "#5e81ac" } },
    waterway:     { grayscale: { dark: "#2d2d2d",  light:   "#dddddd" }, colored: { dark: "#5e81ac",  light: "#5e81ac" } },
    roads: {
      minor:  { grayscale: { dark: "#262626", light: "#cccccc" }, colored: { dark: "#262626", light: "#cccccc" } },
      medium: { grayscale: { dark: "#313131", light: "#bbbbbb" }, colored: { dark: "#313131", light: "#bbbbbb" } },
      major:  { grayscale: { dark: "#424242", light: "#aaaaaa" }, colored: { dark: "#424242", light: "#aaaaaa" } },
    },
    poiCamping:   { grayscale: { dark: "#888888", light: "#666666" }, colored: { dark: "#a3be8c", light: "#4a7a4a" } },
    poiParking:   { grayscale: { dark: "#777777", light: "#777777" }, colored: { dark: "#81a1c1", light: "#2e6096" } },
    poiViewpoint: { grayscale: { dark: "#aaaaaa", light: "#555555" }, colored: { dark: "#d08770", light: "#a04020" } },
    poiAmenity:   { grayscale: { dark: "#666666", light: "#888888" }, colored: { dark: "#ebcb8b", light: "#8b6914" } },
    poiRestrooms:      { grayscale: { dark: "#666666", light: "#888888" }, colored: { dark: "#b48ead", light: "#7a4a7a" } },
    poiTransportation: { grayscale: { dark: "#888888", light: "#666666" }, colored: { dark: "#88c0d0", light: "#2e6a7a" } },
  };

  type PaletteEntry = { grayscale: { dark: string; light: string }; colored: { dark: string; light: string } };
  const theme = dark ? "dark" : "light";
  const c = (entry: PaletteEntry, isColored = false) =>
    isColored ? entry.colored[theme] : entry.grayscale[theme];

  return JSON.stringify({
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sources: {
      osm: {
        type: "vector",
        tiles: [tileUrl("openmaptiles")],
        minzoom: 0,
        maxzoom: 14,
        attribution: "© OpenStreetMap contributors",
      },
      trails: {
        type: "vector",
        tiles: [tileUrl("trails")],
        minzoom: 5,
        maxzoom: 14,
      },
      contours: {
        type: "vector",
        tiles: [tileUrl("contours-feet")],
        minzoom: 8,
        maxzoom: 12,
      },
    },
    layers: [
      // Background
      { id: "background", type: "background", paint: { "background-color": c(palette.background) } },

      // Land
      {
        id: "landcover",
        type: "fill",
        source: "osm",
        "source-layer": "landcover",
        paint: { "fill-color": c(palette.landcover) },
      },
      {
        id: "landuse",
        type: "fill",
        source: "osm",
        "source-layer": "landuse",
        paint: { "fill-color": c(palette.landuse) },
      },
      {
        id: "park",
        type: "fill",
        source: "osm",
        "source-layer": "park",
        paint: { "fill-color": c(palette.park) },
      },

      // Water
      {
        id: "water",
        type: "fill",
        source: "osm",
        "source-layer": "water",
        layout: vis("water"),
        paint: { "fill-color": c(palette.waterFill, colored("water")) },
      },
      {
        id: "waterway",
        type: "line",
        source: "osm",
        "source-layer": "waterway",
        layout: vis("water"),
        paint: { "line-color": c(palette.waterway, colored("water")), "line-width": 1 },
      },

      // Water names
      {
        id: "water-names",
        type: "symbol",
        source: "osm",
        "source-layer": "water_name",
        layout: {
          ...vis("water"),
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "symbol-placement": "point",
        },
        paint: {
          "text-color": c(palette.labels),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // Contours — regular
      {
        id: "contour",
        type: "line",
        source: "contours",
        "source-layer": "contours",
        layout: vis("contours"),
        filter: ["!", ["get", "idx"]],
        paint: { "line-color": c(palette.contours, colored("contours")), "line-width": 0.5, "line-opacity": 0.9 },
      },

      // Contours — index (every 5th)
      {
        id: "contour-index",
        type: "line",
        source: "contours",
        "source-layer": "contours",
        layout: vis("contours"),
        filter: ["get", "idx"],
        paint: { "line-color": c(palette.contourIndex, colored("contours")), "line-width": 1, "line-opacity": 1 },
      },

      // Contour elevation labels (index lines only)
      {
        id: "contour-labels",
        type: "symbol",
        source: "contours",
        "source-layer": "contours",
        filter: ["get", "idx"],
        layout: {
          ...vis("contours"),
          "symbol-placement": "line",
          "text-field": ["to-string", ["get", "ele"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 9,
          "symbol-spacing": 250,
          "text-max-angle": 30,
        },
        paint: {
          "text-color": c(palette.contourIndex, colored("contours")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // Roads
      {
        id: "roads-minor",
        type: "line",
        source: "osm",
        "source-layer": "transportation",
        layout: vis("roads"),
        filter: ["in", "class", "minor", "service", "track"],
        paint: { "line-color": c(palette.roads.minor, colored("roads")), "line-width": 1 },
      },
      {
        id: "roads-medium",
        type: "line",
        source: "osm",
        "source-layer": "transportation",
        layout: vis("roads"),
        filter: ["in", "class", "tertiary", "secondary"],
        paint: { "line-color": c(palette.roads.medium, colored("roads")), "line-width": 1.5 },
      },
      {
        id: "roads-major",
        type: "line",
        source: "osm",
        "source-layer": "transportation",
        layout: vis("roads"),
        filter: ["in", "class", "primary", "trunk", "motorway"],
        paint: { "line-color": c(palette.roads.major, colored("roads")), "line-width": 2.5 },
      },

      // Road labels
      {
        id: "road-labels",
        type: "symbol",
        source: "osm",
        "source-layer": "transportation_name",
        layout: {
          ...vis("roads"),
          "symbol-placement": "line",
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-max-angle": 30,
          "symbol-spacing": 300,
        },
        paint: {
          "text-color": c(palette.labels),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // Trails — from dedicated trail source
      {
        id: "trails",
        type: "line",
        source: "trails",
        "source-layer": "trail",
        layout: { ...vis("trails"), "line-cap": "round" },
        paint: {
          "line-color": c(palette.trails, colored("trails")),
          "line-width": 1,
          "line-dasharray": [3, 2],
        },
      },

      // Trail names
      {
        id: "trail-names",
        type: "symbol",
        source: "trails",
        "source-layer": "trail",
        layout: {
          ...vis("trails"),
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "symbol-placement": "line",
          "text-max-angle": 30,
        },
        paint: {
          "text-color": c(palette.trailLabel, colored("trails")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // Place labels
      {
        id: "place-labels",
        type: "symbol",
        source: "osm",
        "source-layer": "place",
        layout: {
          ...vis("labels"),
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 6, 10, 14, 14],
          "text-max-width": 8,
        },
        paint: {
          "text-color": c(palette.labels),
          "text-halo-color": c(palette.labelHalo),
          "text-halo-width": 1.5,
        },
      },

      // Mountain peak labels
      {
        id: "peak-labels",
        type: "symbol",
        source: "osm",
        "source-layer": "mountain_peak",
        layout: {
          ...vis("labels"),
          "text-field": ["concat", ["get", "name"], "\n", ["get", "ele"], "m"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "text-anchor": "top",
          "text-offset": [0, 0.5],
        },
        paint: {
          "text-color": c(palette.peak),
          "text-halo-color": c(palette.labelHalo),
          "text-halo-width": 1.5,
        },
      },

      // POI — Camping
      {
        id: "poi-camping",
        type: "symbol",
        source: "osm",
        "source-layer": "poi",
        minzoom: 12,
        filter: ["in", "class", "campsite", "picnic_site", "wilderness_hut"],
        layout: {
          ...vis("poiCamping"),
          "text-field": ["coalesce", ["get", "name"], "Camping"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 0.2],
        },
        paint: {
          "text-color": c(palette.poiCamping, colored("poiCamping")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // POI — Parking
      {
        id: "poi-parking",
        type: "symbol",
        source: "osm",
        "source-layer": "poi",
        minzoom: 13,
        filter: ["==", "class", "parking"],
        layout: {
          ...vis("poiParking"),
          "text-field": ["coalesce", ["get", "name"], "P"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 0.2],
        },
        paint: {
          "text-color": c(palette.poiParking, colored("poiParking")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // POI — Viewpoints
      {
        id: "poi-viewpoints",
        type: "symbol",
        source: "osm",
        "source-layer": "poi",
        minzoom: 12,
        filter: ["in", "class", "viewpoint", "attraction"],
        layout: {
          ...vis("poiViewpoints"),
          "text-field": ["coalesce", ["get", "name"], "View"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 0.2],
        },
        paint: {
          "text-color": c(palette.poiViewpoint, colored("poiViewpoints")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // POI — Amenities
      {
        id: "poi-amenities",
        type: "symbol",
        source: "osm",
        "source-layer": "poi",
        minzoom: 14,
        filter: ["in", "class", "drinking_water", "shelter", "waste_basket"],
        layout: {
          ...vis("poiAmenities"),
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 0.2],
        },
        paint: {
          "text-color": c(palette.poiAmenity, colored("poiAmenities")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // POI — Transportation
      {
        id: "poi-transportation",
        type: "symbol",
        source: "osm",
        "source-layer": "poi",
        minzoom: 13,
        filter: ["in", "class", "bus", "rail", "subway", "tram", "ferry", "airport"],
        layout: {
          ...vis("poiTransportation"),
          "text-field": ["coalesce", ["get", "name"], ["get", "class"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 0.2],
        },
        paint: {
          "text-color": c(palette.poiTransportation, colored("poiTransportation")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },

      // POI — Restrooms
      {
        id: "poi-restrooms",
        type: "symbol",
        source: "osm",
        "source-layer": "poi",
        minzoom: 14,
        filter: ["==", "class", "toilets"],
        layout: {
          ...vis("poiRestrooms"),
          "text-field": ["coalesce", ["get", "name"], "Restroom"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 0.2],
        },
        paint: {
          "text-color": c(palette.poiRestrooms, colored("poiRestrooms")),
          "text-halo-color": c(palette.textHalo),
          "text-halo-width": 1.5,
        },
      },
    ],
  });
}
