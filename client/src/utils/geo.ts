// Geo math utilities for the animated Live Ops map (Item 15)
// Convention: all coordinates passed as [lng, lat] (API format); Leaflet wants [lat, lng].
// Owner: Developer 2 (Web Frontend Engineer)

const R = 6371; // Earth radius km
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export interface LatLng {
  lat: number;
  lng: number;
}

/** Haversine distance in km between two [lng, lat] points. */
export const haversineKm = (a: [number, number], b: [number, number]): number => {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

/** Initial bearing (degrees, 0=N) from point a to point b — both [lng, lat]. */
export const bearing = (a: [number, number], b: [number, number]): number => {
  const lng1 = toRad(a[0]);
  const lat1 = toRad(a[1]);
  const lng2 = toRad(b[0]);
  const lat2 = toRad(b[1]);
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

/** Ease-in-out cubic — smooth acceleration/deceleration for marker lerp. */
export const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Linear interpolation between two LatLng (no curvature — fine for short hops). */
export const lerpLatLng = (a: LatLng, b: LatLng, t: number): LatLng => ({
  lat: lerp(a.lat, b.lat, t),
  lng: lerp(a.lng, b.lng, t),
});

/**
 * Quadratic bezier through a control point offset perpendicular to the straight
 * line, scaled by distance — gives a road-like curve fallback when no routing
 * API is available.
 */
export const bezierRoute = (
  a: [number, number],
  b: [number, number],
  samples = 64,
): [number, number][] => {
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const dist = haversineKm(a, b);
  // Perpendicular offset (in degrees) proportional to distance, capped.
  const bulge = clamp(dist * 0.045, 0.15, 0.9);
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ctrl: [number, number] = [
    mid[0] + (-dy / len) * bulge,
    mid[1] + (dx / len) * bulge,
  ];
  const pts: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const inv = 1 - t;
    pts.push([
      inv * inv * a[0] + 2 * inv * t * ctrl[0] + t * t * b[0],
      inv * inv * a[1] + 2 * inv * t * ctrl[1] + t * t * b[1],
    ]);
  }
  return pts;
};

/** Point on a bezier polyline at normalized progress t (0..1). */
export const pointAtProgress = (
  route: [number, number][],
  t: number,
): [number, number] => {
  if (route.length === 0) return [0, 0];
  const clamped = clamp(t, 0, 1);
  const idx = clamped * (route.length - 1);
  const i = Math.floor(idx);
  if (i >= route.length - 1) return route[route.length - 1]!;
  const frac = idx - i;
  const p1 = route[i]!;
  const p2 = route[i + 1]!;
  return [p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac];
};

/** Convert [lng, lat] → Leaflet [lat, lng], with safety for missing data. */
export const toLeaflet = (ll?: [number, number] | null): LatLng | null => {
  if (!ll || !Array.isArray(ll) || ll.length < 2 || isNaN(ll[0]) || isNaN(ll[1]))
    return null;
  return { lat: ll[1], lng: ll[0] };
};
