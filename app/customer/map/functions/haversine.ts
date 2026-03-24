// ── Haversine distance (metres) ───────────────────────────────────────────────
// haversine formula - great-circle distance between two lat/lng points

type LatLng = [number, number];

export function haversine(pointA: LatLng, pointB: LatLng): number {
  const EARTH_RADIUS_METERS = 6_371_000;

  // Trig functions require radians, but lat/lng is in degress

  const toRadian = (degrees: number) => (degrees * Math.PI) / 180;

  // Angular difference between two points
  const deltaLat = toRadian(pointB[0] - pointA[0]);
  const deltaLon = toRadian(pointB[1] - pointA[1]);

  // Core haversine - maps the two points onto a unit sphere (result: 0 -1 )
  // cos(lat) corrects for longitude lines converging towards the poles

  const haversineValue =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadian(pointA[0])) *
      Math.cos(toRadian(pointB[0])) *
      Math.sin(deltaLon / 2) ** 2;

  // inverse haversine - arc angle, then scale by Earth's radius  to get metres
  return EARTH_RADIUS_METERS * 2 * Math.asin(Math.sqrt(haversineValue));
}
