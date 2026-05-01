// Exact definitions (by international standard)
export const FT_PER_MI = 5280;
export const M_PER_MI = 1609.344;
export const M_PER_KM = 1000;

// Derived
export const FT_PER_M = FT_PER_MI / M_PER_MI;
export const M_PER_FT = M_PER_MI / FT_PER_MI;
export const KM_PER_MI = M_PER_MI / M_PER_KM;

export function metersToFeet(m: number) { return m * FT_PER_M; }
export function feetToMeters(ft: number) { return ft * M_PER_FT; }
export function milesToMeters(mi: number) { return mi * M_PER_MI; }
export function metersToMiles(m: number) { return m / M_PER_MI; }
export function milesToKm(mi: number) { return mi * KM_PER_MI; }
export function feetToMiles(ft: number) { return ft / FT_PER_MI; }

export function formatDistance(miles: number, units: "imperial" | "metric"): string {
  return units === "imperial"
    ? `${miles.toFixed(1)} mi`
    : `${milesToKm(miles).toFixed(1)} km`;
}

export function formatElevation(meters: number, units: "imperial" | "metric"): string {
  return units === "imperial"
    ? `${Math.round(metersToFeet(meters))} ft`
    : `${Math.round(meters)} m`;
}

export function formatAccuracy(meters: number, units: "imperial" | "metric"): string {
  return `±${formatElevation(meters, units)}`;
}
