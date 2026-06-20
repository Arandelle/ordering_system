export const isValidCoordinate = (lat?: unknown, lng?: unknown) =>
  typeof lat === "number" &&
  Number.isFinite(lat) &&
  lat >= -90 &&
  lat <= 90 &&
  typeof lng === "number" &&
  Number.isFinite(lng) &&
  lng >= -180 &&
  lng <= 180;
