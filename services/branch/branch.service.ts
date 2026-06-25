// ---------------------------------------------------------------------------
// Branch helpers
// ---------------------------------------------------------------------------

import { Branch } from "@/models/Branch";
import { ClientSession } from "mongoose";

/**
 * Fetch a branch by ID and verify it is available for ordering.
 * Throws if the branch is inactive or flagged as opening soon.
 */
export async function fetchBranch(branchId: string, session: ClientSession) {
  const branch = await Branch.findById(branchId).session(session);
  if (!branch) throw new Error("Branch not found!");
  if (!branch.isActive) throw new Error("This branch is currently inactive and cannot accept orders.");
  if (branch.openingSoon) throw new Error("This branch is opening soon and is not yet accepting orders.");
  return branch;
}

export const isBranchCoordinates = (
  coordinates: unknown,
): coordinates is [number, number] =>
  Array.isArray(coordinates) &&
  coordinates.length === 2 &&
  coordinates.every(
    (coord) => typeof coord === "number" && Number.isFinite(coord),
  );