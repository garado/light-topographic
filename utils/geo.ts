import { metersToFeet, feetToMeters, feetToMiles, milesToMeters, FT_PER_MI } from "./units";

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

  let niceMeters: number;
  let label: string;

  if (units === "imperial") {
    const targetFeet = metersToFeet(targetMeters);
    const targetMi = feetToMiles(targetFeet);
    const ftSteps = [50, 100, 200, 500, 1000, 2000];
    const miSteps = [0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
    if (targetMi < miSteps[0]) {
      const niceFt = ftSteps.find((s) => s >= targetFeet) ?? ftSteps[ftSteps.length - 1];
      niceMeters = feetToMeters(niceFt);
      label = `${niceFt} ft`;
    } else {
      const niceMi = miSteps.find((s) => s >= targetMi) ?? miSteps[miSteps.length - 1];
      niceMeters = milesToMeters(niceMi);
      label = `${niceMi} mi`;
    }
  } else {
    const mSteps = [50, 100, 200, 500, 1000, 2000];
    const kmSteps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    if (targetMeters < kmSteps[0] * 1000) {
      const niceM = mSteps.find((s) => s >= targetMeters) ?? mSteps[mSteps.length - 1];
      niceMeters = niceM;
      label = `${niceM} m`;
    } else {
      const targetKm = targetMeters / 1000;
      const niceKm = kmSteps.find((s) => s >= targetKm) ?? kmSteps[kmSteps.length - 1];
      niceMeters = niceKm * 1000;
      label = `${niceKm} km`;
    }
  }

  return { widthPx: niceMeters / metersPerPx, label };
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
