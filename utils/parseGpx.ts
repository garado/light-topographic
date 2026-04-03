import { XMLParser } from "fast-xml-parser";

export type GpxRoute = {
  name: string | null;
  geojson: {
    type: "Feature";
    geometry: { type: "LineString"; coordinates: [number, number][] };
    properties: Record<string, never>;
  };
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export function parseGpx(content: string): GpxRoute | null {
  const result = parser.parse(content);
  const gpx = result.gpx;
  if (!gpx) return null;

  const coords: [number, number][] = [];
  let name: string | null = null;

  if (gpx.trk) {
    const tracks = Array.isArray(gpx.trk) ? gpx.trk : [gpx.trk];
    name = typeof tracks[0]?.name === "string" ? tracks[0].name : null;
    for (const trk of tracks) {
      const segs = Array.isArray(trk.trkseg) ? trk.trkseg : [trk.trkseg];
      for (const seg of segs) {
        if (!seg?.trkpt) continue;
        const pts = Array.isArray(seg.trkpt) ? seg.trkpt : [seg.trkpt];
        for (const pt of pts) {
          coords.push([parseFloat(pt["@_lon"]), parseFloat(pt["@_lat"])]);
        }
      }
    }
  }

  if (coords.length === 0 && gpx.rte) {
    const routes = Array.isArray(gpx.rte) ? gpx.rte : [gpx.rte];
    name = typeof routes[0]?.name === "string" ? routes[0].name : null;
    for (const rte of routes) {
      if (!rte.rtept) continue;
      const pts = Array.isArray(rte.rtept) ? rte.rtept : [rte.rtept];
      for (const pt of pts) {
        coords.push([parseFloat(pt["@_lon"]), parseFloat(pt["@_lat"])]);
      }
    }
  }

  if (coords.length < 2) return null;

  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);

  return {
    name,
    geojson: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: {},
    },
    bounds: [
      Math.min(...lngs),
      Math.min(...lats),
      Math.max(...lngs),
      Math.max(...lats),
    ],
  };
}
