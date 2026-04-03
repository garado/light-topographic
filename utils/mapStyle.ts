export function buildMapStyle(apiKey: string) {
  return JSON.stringify({
    version: 8,
    sources: {
      protomaps: {
        type: "vector",
        tiles: [`https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.pbf?key=${apiKey}`],
        minzoom: 0,
        maxzoom: 15,
        attribution: "Protomaps © OpenStreetMap",
      },
    },
    layers: [
      // Land
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#0d0d0d" },
      },
      {
        id: "earth",
        type: "fill",
        source: "protomaps",
        "source-layer": "earth",
        paint: { "fill-color": "#111111" },
      },
      // Natural areas (forests, parks)
      {
        id: "natural",
        type: "fill",
        source: "protomaps",
        "source-layer": "natural",
        paint: { "fill-color": "#181818" },
      },
      // Water
      {
        id: "water",
        type: "fill",
        source: "protomaps",
        "source-layer": "water",
        paint: { "fill-color": "#2a2a2a" },
      },
      {
        id: "waterway",
        type: "line",
        source: "protomaps",
        "source-layer": "waterway",
        paint: { "line-color": "#3a3a3a", "line-width": 1 },
      },
      // Roads — minor
      {
        id: "roads-other",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["in", "pmap:kind", "other", "minor_road"],
        paint: { "line-color": "#2a2a2a", "line-width": 1 },
      },
      // Roads — medium
      {
        id: "roads-medium",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["==", "pmap:kind", "medium_road"],
        paint: { "line-color": "#3a3a3a", "line-width": 1.5 },
      },
      // Roads — major
      {
        id: "roads-major",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["==", "pmap:kind", "major_road"],
        paint: { "line-color": "#4a4a4a", "line-width": 2 },
      },
      // Highways
      {
        id: "roads-highway",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["==", "pmap:kind", "highway"],
        paint: { "line-color": "#606060", "line-width": 3 },
      },
      // Trails & paths — key for hiking
      {
        id: "paths",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["==", "pmap:kind", "path"],
        paint: {
          "line-color": "#888888",
          "line-width": 1,
          "line-dasharray": [3, 2],
        },
      },
    ],
  });
}
