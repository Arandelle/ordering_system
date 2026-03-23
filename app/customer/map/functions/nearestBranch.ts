import { Branch, BRANCHES } from "../mockupData";
import { haversine } from "./haversine";

// Returns the nearest branch + distance in km
export function nearestBranch(latlng: [number, number]): {
  branch: Branch;
  km: number;
} {
  let nearest = BRANCHES[0];
  let minDist = haversine(latlng, BRANCHES[0].position);

  for (const branch of BRANCHES.slice(1)) {
    const d = haversine(latlng, branch.position);
    if (d < minDist) {
      minDist = d;
      nearest = branch;
    }
  }

  return { branch: nearest, km: minDist / 1000 };
}