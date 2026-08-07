// Service for: Haversine distance calculation + travel duration estimation
// Module: Backend Services (Module 6) | Owner: Developer 1
// Calculates distance between GPS coordinates, estimates duration at 60 km/h

const EARTH_RADIUS_KM = 6371;
const AVERAGE_SPEED_KMH = 60;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function estimateDurationMinutes(distanceKm: number, averageSpeedKmh = AVERAGE_SPEED_KMH): number {
  if (distanceKm <= 0) return 0;
  return Math.ceil((distanceKm / averageSpeedKmh) * 60);
}

export interface RouteResult {
  distanceKm: number;
  estimatedDurationMinutes: number;
}

export function calculateRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): RouteResult {
  const distanceKm = Math.round(haversineDistanceKm(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  ) * 10) / 10;
  const estimatedDurationMinutes = estimateDurationMinutes(distanceKm);
  return { distanceKm, estimatedDurationMinutes };
}

export default { haversineDistanceKm, estimateDurationMinutes, calculateRoute };
