import type { MapLayers } from "@/contexts/MapLayersContext";

const TILE_BASE = "https://tiles.openstreetmap.us/vector";

export function buildMapStyle(layers: MapLayers, offlineOnly = false) {
  const tileUrl = (path: string) =>
    offlineOnly ? `http://localhost:0/${path}/{z}/{x}/{y}` : `${TILE_BASE}/${path}/{z}/{x}/{y}.mvt`;
  const vis = (key: keyof MapLayers) =>
    ({ visibility: layers[key].visible ? "visible" : "none" } as const);

  const contourColor = layers.contours.color ? "#c87941" : "#ffffff";
  const contourIndexColor = layers.contours.color ? "#a05020" : "#ffffff";
  const trailColor = layers.trails.color ? "#a3be8c" : "#888888";
  const trailLabelColor = layers.trails.color ? "#a3be8c" : "#aaaaaa";
  const waterFillColor = layers.water.color ? "#5e81ac" : "#262626";
  const waterwayColor = layers.water.color ? "#5e81ac" : "#2d2d2d";
  const roadMinorColor = layers.roads.color ? "#262626" : "#262626";
  const roadMediumColor = layers.roads.color ? "#313131" : "#313131";
  const roadMajorColor = layers.roads.color ? "#424242" : "#424242";

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
      { id: "background", type: "background", paint: { "background-color": "#000000" } },

      // Land
      {
        id: "landcover",
        type: "fill",
        source: "osm",
        "source-layer": "landcover",
        paint: { "fill-color": "#0d0d0d" },
      },
      {
        id: "landuse",
        type: "fill",
        source: "osm",
        "source-layer": "landuse",
        paint: { "fill-color": "#141414" },
      },
      {
        id: "park",
        type: "fill",
        source: "osm",
        "source-layer": "park",
        paint: { "fill-color": "#161616" },
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
          "text-halo-color": "#000000",
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
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
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
          "text-color": "#cccccc",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        },
      },
    ],
  });
}
