type DeliveryAreaCoordinates = {
  lat: number;
  lng: number;
};

/**
 * Center point for initial map view — roughly Makati CBD.
 */
export const METRO_MANILA_CENTER: [number, number] = [14.5547, 121.0244];

/**
 * Kept for backward compatibility; the polygon check is the authoritative
 * boundary for delivery eligibility.
 */
export const METRO_MANILA_DELIVERY_RADIUS_METERS = 12_000;
export const OUTSIDE_DELIVERY_AREA_MESSAGE =
  "Delivery is only available within the Makati and nearby cities service area.";

/**
 * Temporary city-level restriction on top of the polygon check.
 * Only addresses whose resolved city/suburb/municipality matches one of
 * these names (case-insensitive) will be accepted.
 *
 * To remove the restriction, simply empty this array — the check
 * function will then always return true.
 */
export const ALLOWED_DELIVERY_CITIES: string[] = [
  "mandaluyong",
  "pasay",
  "makati",
];

export const CITY_RESTRICTION_MESSAGE =
  "Delivery is currently limited to Mandaluyong, Pasay, and Makati only.";

/**
 * Checks whether a reverse-geocoded address belongs to an allowed city.
 * When ALLOWED_DELIVERY_CITIES is empty, this always returns true
 * (no city restriction active).
 *
 * Nominatim may populate city, town, municipality, suburb, or
 * city_district — we check all of them against the allowed list.
 */
export const isCityAllowedForDelivery = (
  address: {
    city?: string;
    town?: string;
    municipality?: string;
    suburb?: string;
    city_district?: string;
  },
): boolean => {
  if (ALLOWED_DELIVERY_CITIES.length === 0) return true;

  const candidates = [
    address.city,
    address.town,
    address.municipality,
    address.suburb,
    address.city_district,
  ];

  return candidates.some((candidate) => {
    if (!candidate) return false;
    const normalized = candidate.trim().toLowerCase();
    return ALLOWED_DELIVERY_CITIES.some(
      (allowed) => normalized.includes(allowed),
    );
  });
};

/**
 * Polygon boundary covering Makati + nearby core delivery cities:
 * Makati, Taguig/BGC, Pasay, Mandaluyong, Pasig, Parañaque.
 * Coordinates are ordered clockwise and form a closed loop (first == last).
 */
export const DELIVERY_AREA_POLYGON: [number, number][] = [
  // Northwest — near Pasay / Manila border
  [14.575, 120.99],
  // North — Mandaluyong / San Juan border area
  [14.595, 121.01],
  // Northeast — Pasig / Marikina border edge
  [14.6, 121.045],
  // East — Pasig (Ortigas area)
  [14.59, 121.07],
  // Southeast — Pasig / Taguig border (BGC area)
  [14.56, 121.075],
  // South — Taguig / Parañaque border
  [14.52, 121.04],
  // Southwest — Parañaque / Baclaran area
  [14.5, 121.01],
  // West — Pasay / NAIA area
  [14.51, 120.985],
  // Close the polygon — back to northwest
  [14.575, 120.99],
];

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const getDistanceMeters = (
  from: DeliveryAreaCoordinates,
  to: DeliveryAreaCoordinates,
) => {
  const latDistance = toRadians(to.lat - from.lat);
  const lngDistance = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const haversine =
    Math.sin(latDistance / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDistance / 2) ** 2;

  return (
    EARTH_RADIUS_METERS *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

/**
 * Ray-casting point-in-polygon test.
 * Returns true when the point lies on an edge or inside the polygon.
 */
export const isPointInPolygon = (
  point: DeliveryAreaCoordinates, // user's location
  polygon: [number, number][], // delivery area
) => {
  const { lat, lng } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
};

/**
 * Checks whether the given coordinates fall inside the allowed delivery
 * polygon (Makati + nearby core cities).
 */
export const isWithinMetroManilaDeliveryArea = (
  coordinates: DeliveryAreaCoordinates,
) => {
  return isPointInPolygon(coordinates, DELIVERY_AREA_POLYGON);
};

//**
// Check coordinates if within radius (not yet used)
// 
//  */
export const isWithinMetroManilaDeliveryAreaRadius = (
  coordinates: DeliveryAreaCoordinates,
) => {
  const distanceMeters = getDistanceMeters(
    {
      lat: METRO_MANILA_CENTER[0],
      lng: METRO_MANILA_CENTER[1],
    },
    coordinates,
  );

  return distanceMeters <= METRO_MANILA_DELIVERY_RADIUS_METERS;
};
