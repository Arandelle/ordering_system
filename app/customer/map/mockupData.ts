import L from "leaflet"


// Branch Data
export interface Branch {
  id: number;
  name: string;
  address: string;
  position: [number, number];
}

export const BRANCHES: Branch[] = [
  {
    id: 1,
    name: "Harrison BGC Branch",
    address: "30th St, Bonifacio Global City, Taguig",
    position: [14.5514, 121.0494],
  },
  {
    id: 2,
    name: "Harrison Quezon City Branch",
    address: "Tomas Morato Ave, Quezon City",
    position: [14.5789, 121.0345],
  },
  {
    id: 3,
    name: "Harrison Makati Branch",
    address: "Ayala Ave, Makati City",
    position: [14.5547, 121.0244],
  },
];

// ------ Custom Icon ---------------
export const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Red pin for branch markers
export const branchIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const nearestBranchIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});