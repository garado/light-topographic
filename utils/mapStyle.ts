import type { MapLayers } from "@/contexts/MapLayersContext";

const TILE_BASE = "https://tiles.openstreetmap.us/vector";

export function buildMapStyle(layers: MapLayers, invertColors = false, offlineOnly = false) {
  const tileUrl = (path: string) =>
    offlineOnly ? `http://localhost:0/${path}/{z}/{x}/{y}` : `${TILE_BASE}/${path}/{z}/{x}/{y}.mvt`;
  const vis = (key: keyof MapLayers) =>
    ({ visibility: layers[key].visible ? "visible" : "none" } as const);

  const dark = !invertColors;
  const colored = (key: keyof MapLayers) => layers[key].color;

  // Base theme palette
  const bgColor         = dark ? "#000000" : "#ffffff";
  const landcoverColor  = dark ? "#0d0d0d"  : "#f0f0f0";
  const landuseColor    = dark ? "#141414"  : "#e8e8e8";
  const parkColor       = dark ? "#161616"  : "#e4ede4";
  const labelColor      = dark ? "#ffffff"  : "#111111";
  const labelHalo       = dark ? "#000000"  : "#ffffff";
  const peakLabelColor  = dark ? "#cccccc"  : "#333333";
  const textHaloColor   = dark ? "#0d0d0d"  : "#ffffff";

  const contourColor      = colored("contours") ? "#c87941" : (dark ? "#ffffff" : "#777777");
  const contourIndexColor = colored("contours") ? "#a05020" : (dark ? "#ffffff" : "#555555");
  const trailColor        = colored("trails")   ? "#a3be8c" : (dark ? "#888888" : "#777777");
  const trailLabelColor   = colored("trails")   ? "#a3be8c" : (dark ? "#aaaaaa" : "#666666");
  const waterFillColor    = colored("water")    ? "#5e81ac" : (dark ? "#262626" : "#c4d8ec");
  const waterwayColor     = colored("water")    ? "#5e81ac" : (dark ? "#2d2d2d" : "#c4d8ec");
  const roadMinorColor    = dark ? "#262626" : "#cccccc";
  const roadMediumColor   = dark ? "#313131" : "#bbbbbb";
  const roadMajorColor    = dark ? "#424242" : "#aaaaaa";

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
      { id: "background", type: "background", paint: { "background-color": bgColor } },

      // Land
      {
        id: "landcover",
        type: "fill",
        source: "osm",
        "source-layer": "landcover",
        paint: { "fill-color": landcoverColor },
      },
      {
        id: "landuse",
        type: "fill",
        source: "osm",
        "source-layer": "landuse",
        paint: { "fill-color": landuseColor },
      },
      {
        id: "park",
        type: "fill",
        source: "osm",
        "source-layer": "park",
        paint: { "fill-color": parkColor },
      },

      // Water
      {
        id: "water",
        type: "fill",
        source: "osm",
        "source-layer": "water",
        layout: vis("water"),
        paint: { "fill-color": waterFillColor },
      },
      {
        id: "waterway",
        type: "line",
        source: "osm",
        "source-layer": "waterway",
        layout: vis("water"),
        paint: { "line-color": waterwayColor, "line-width": 1 },
      },

      // Contours — regular
      {
        id: "contour",
        type: "line",
        source: "contours",
        "source-layer": "contours",
        layout: vis("contours"),
        filter: ["!", ["get", "idx"]],
        paint: { "line-color": contourColor, "line-width": 0.5, "line-opacity": 0.9 },
      },

      // Contours — index (every 5th)
      {
        id: "contour-index",
        type: "line",
        source: "contours",
        "source-layer": "contours",
        layout: vis("contours"),
        filter: ["get", "idx"],
        paint: { "line-color": contourIndexColor, "line-width": 1, "line-opacity": 1 },
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
          "text-color": contourIndexColor,
          "text-halo-color": "#0d0d0d",
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
        paint: { "line-color": roadMinorColor, "line-width": 1 },
      },
      {
        id: "roads-medium",
        type: "line",
        source: "osm",
        "source-layer": "transportation",
        layout: vis("roads"),
        filter: ["in", "class", "tertiary", "secondary"],
        paint: { "line-color": roadMediumColor, "line-width": 1.5 },
      },
      {
        id: "roads-major",
        type: "line",
        source: "osm",
        "source-layer": "transportation",
        layout: vis("roads"),
        filter: ["in", "class", "primary", "trunk", "motorway"],
        paint: { "line-color": roadMajorColor, "line-width": 2.5 },
      },

      // Trails — from dedicated trail source
      {
        id: "trails",
        type: "line",
        source: "trails",
        "source-layer": "trail",
        layout: { ...vis("trails"), "line-cap": "round" },
        paint: {
          "line-color": trailColor,
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
          "text-color": trailLabelColor,
          "text-halo-color": textHaloColor,
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
          "text-color": labelColor,
          "text-halo-color": labelHalo,
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
          "text-color": peakLabelColor,
          "text-halo-color": labelHalo,
          "text-halo-width": 1.5,
        },
      },
    ],
  });
}
