export function routeTotalMiles(coords: [number, number][]): number {
  const R = 3958.8;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return total;
}

export function scaleBarInfo(zoom: number, lat: number, units: "imperial" | "metric"): { widthPx: number; label: string } {
  const metersPerPx = (156543.03392 * Math.cos(lat * Math.PI / 180)) / Math.pow(2, zoom);
  const targetMeters = 80 * metersPerPx;
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const nice = steps.find((s) => s >= targetMeters) ?? steps[steps.length - 1];
  const widthPx = nice / metersPerPx;
  let label: string;
  if (units === "imperial") {
    const feet = nice * 3.28084;
    label = feet < 528 ? `${Math.round(feet)} ft` : `${(feet / 5280).toFixed(1)} mi`;
  } else {
    label = nice < 1000 ? `${nice} m` : `${(nice / 1000).toFixed(nice < 10000 ? 1 : 0)} km`;
  }
  return { widthPx, label };
}

export function interpolateRoute(coords: [number, number][], t: number): [number, number] {
  if (t <= 0) return coords[0];
  if (t >= 1) return coords[coords.length - 1];
  const dists: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const total = dists[dists.length - 1];
  const target = t * total;
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= target) {
      const seg = (target - dists[i - 1]) / (dists[i] - dists[i - 1]);
      return [
        coords[i - 1][0] + seg * (coords[i][0] - coords[i - 1][0]),
        coords[i - 1][1] + seg * (coords[i][1] - coords[i - 1][1]),
      ];
    }
  }
  return coords[coords.length - 1];
}
