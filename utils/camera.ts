import type { RefObject } from "react";

const SKIP_ANIM_THRESHOLD = 5; // combined lat+lon degrees, ~310 miles

export async function resolveAnimDuration(
  mapRef: RefObject<any>,
  lon: number,
  lat: number,
  normalDuration: number,
): Promise<number> {
  if (!mapRef.current) return normalDuration;
  try {
    const [[maxLng, maxLat], [minLng, minLat]] = await mapRef.current.getVisibleBounds();
    const dist = Math.abs(lon - (minLng + maxLng) / 2) + Math.abs(lat - (minLat + maxLat) / 2);
    return dist > SKIP_ANIM_THRESHOLD ? 0 : normalDuration;
  } catch {
    return normalDuration;
  }
}
