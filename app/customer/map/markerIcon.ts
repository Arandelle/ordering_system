import L from "leaflet";

const SHADOW_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const ICON_URLS = {
  blue: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  green:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  orange:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  violet:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
} as const;

type IconColor = keyof typeof ICON_URLS;

const createIcon = (color: IconColor): L.Icon =>
  new L.Icon({
    iconUrl: ICON_URLS[color],
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

export const userIcon = createIcon("blue");
export const branchIcon = createIcon("red");
export const nearestBranchIcon = createIcon("green");
export const selectedBranchIcon = createIcon("orange");
export const selectedAndNearestBranchIcon = createIcon("violet");
