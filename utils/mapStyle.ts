import type { MapLayers } from "@/contexts/MapLayersContext";
import { darkMatter } from "./mapStyle/darkMatter";
import { positron } from "./mapStyle/positron";
import { coloredDark, coloredLight } from "./mapStyle/colored";
import type { Palette } from "./mapStyle/types";

const TILE_BASE = "https://tiles.openstreetmap.us/vector";

export function buildMapStyle(layers: MapLayers, invertColors = false, offlineOnly = false) {
  const tileUrl = (path: string) =>
    offlineOnly ? `http://localhost:0/${path}/{z}/{x}/{y}` : `${TILE_BASE}/${path}/{z}/{x}/{y}.mvt`;
  const vis = (key: keyof MapLayers) =>
    ({ visibility: layers[key].visible ? "visible" : "none" } as const);

  const dark = !invertColors;
  const base: Palette = dark ? darkMatter : positron;
  const over: Palette = dark ? coloredDark : coloredLight;
  const c = (key: keyof Omit<Palette, "roads">, isColored = false): string =>
    isColored ? over[key] : base[key];
  const road = (sub: keyof Palette["roads"], isColored = false): string =>
    isColored ? over.roads[sub] : base.roads[sub];

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
      { id: "background", type: "background", paint: { "background-color": c("background") } },

      // Land
      {
        id: "landcover",
        type: "fill",
        source: "osm",
        "source-layer": "landcover",
        paint: { "fill-color": c("landcover") },
      },
      {
        id: "landuse",
        type: "fill",
        source: "osm",
        "source-layer": "landuse",
        paint: { "fill-color": c("landuse") },
      },
      {
        id: "park",
        type: "fill",
        source: "osm",
        "source-layer": "park",
        paint: { "fill-color": c("park") },
      },

      // Water
      {
        id: "water",
        type: "fill",
        source: "osm",
        "source-layer": "water",
        layout: vis("water"),
        paint: { "fill-color": c("waterFill", layers.water.color), "fill-opacity": 0.3 },
      },
      {
        id: "waterway",
        type: "line",
        source: "osm",
        "source-layer": "waterway",
        layout: vis("water"),
        paint: { "line-color": c("waterway", layers.water.color), "line-width": 1, "line-opacity": 0.3 },
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
          "text-color": c("labels"),
          "text-halo-color": c("textHalo"),
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
        paint: { "line-color": c("contours", layers.contours.color), "line-width": 0.5, "line-opacity": 0.4 },
      },

      // Contours — index (every 5th)
      {
        id: "contour-index",
        type: "line",
        source: "contours",
        "source-layer": "contours",
        layout: vis("contours"),
        filter: ["get", "idx"],
        paint: { "line-color": c("contourIndex", layers.contours.color), "line-width": 1.5, "line-opacity": 0.4 },
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
          "text-color": c("contourIndex", layers.contours.color),
          "text-halo-color": c("textHalo"),
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
        paint: { "line-color": road("minor", layers.roads.color), "line-width": 1 },
      },
      {
        id: "roads-medium",
        type: "line",
        source: "osm",
        "source-layer": "transportation",
        layout: vis("roads"),
        filter: ["in", "class", "tertiary", "secondary"],
        paint: { "line-color": road("medium", layers.roads.color), "line-width": 1.5 },
      },
      {
        id: "roads-major",
        type: "line",
        source: "osm",
        "source-layer": "transportation",
        layout: vis("roads"),
        filter: ["in", "class", "primary", "trunk", "motorway"],
        paint: { "line-color": road("major", layers.roads.color), "line-width": 2.5 },
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
          "text-color": c("labels"),
          "text-halo-color": c("textHalo"),
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
          "line-color": c("trails", layers.trails.color),
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
          "text-color": c("trailLabel", layers.trails.color),
          "text-halo-color": c("textHalo"),
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
          "text-color": c("labels"),
          "text-halo-color": c("labelHalo"),
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
          "text-color": c("peak"),
          "text-halo-color": c("labelHalo"),
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
          "text-color": c("poiCamping", layers.poiCamping.color),
          "text-halo-color": c("textHalo"),
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
          "text-color": c("poiParking", layers.poiParking.color),
          "text-halo-color": c("textHalo"),
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
          "text-color": c("poiViewpoint", layers.poiViewpoints.color),
          "text-halo-color": c("textHalo"),
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
          "text-color": c("poiAmenity", layers.poiAmenities.color),
          "text-halo-color": c("textHalo"),
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
          "text-color": c("poiTransportation", layers.poiTransportation.color),
          "text-halo-color": c("textHalo"),
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
          "text-color": c("poiRestrooms", layers.poiRestrooms.color),
          "text-halo-color": c("textHalo"),
          "text-halo-width": 1.5,
        },
      },
    ],
  });
}
