const R = 6371; // Earth radius in km

export interface Coord {
  lat: number;
  lng: number;
}

export const haversineKm = (a: Coord, b: Coord): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

export const estimateDurationMinutes = (distanceKm: number, avgSpeedKmph = 60): number =>
  Math.round((distanceKm / avgSpeedKmph) * 60);

/**
 * Compute route estimate from two [lng, lat] coordinate pairs.
 * Returns null when either pair is missing/invalid.
 */
export const routeFromCoords = (
  origin?: [number, number] | null,
  destination?: [number, number] | null,
): { estimatedDistanceKm: number; estimatedDurationMinutes: number } | null => {
  if (
    !origin ||
    !destination ||
    origin.length < 2 ||
    destination.length < 2 ||
    isNaN(origin[0]) ||
    isNaN(origin[1]) ||
    isNaN(destination[0]) ||
    isNaN(destination[1])
  ) {
    return null;
  }
  const distanceKm = haversineKm(
    { lat: origin[1], lng: origin[0] },
    { lat: destination[1], lng: destination[0] },
  );
  return {
    estimatedDistanceKm: Math.round(distanceKm * 10) / 10,
    estimatedDurationMinutes: estimateDurationMinutes(distanceKm),
  };
};
