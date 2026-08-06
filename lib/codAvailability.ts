/**
 * Resolves whether Cash on Delivery is available for a given branch.
 *
 * Branch-level `codEnabled` is a tri-state override:
 *   - "global"   → defer to the global `settings.codEnabled` toggle.
 *   - "enabled"  → force COD on for this branch.
 *   - "disabled" → force COD off for this branch.
 */

export type BranchCodOverride = "global" | "enabled" | "disabled";

export const resolveCodAvailability = (
  branchCodEnabled: BranchCodOverride | undefined,
  globalCodEnabled: boolean,
): boolean => {
  if (branchCodEnabled === "enabled") return true;
  if (branchCodEnabled === "disabled") return false;
  return globalCodEnabled;
};
