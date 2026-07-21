import { StaffRole, STAFF_ROLES } from "@/types/staff";

/** Action shorthand arrays — keeps the permission table scannable */
const R = ["read"] as const;
const RU = ["read", "update"] as const;
const RCU = ["read", "create", "update"] as const;
const FULL = ["read", "create", "update", "delete"] as const;

/**
 * Resource → Actions per role.
 *
 * To add a new resource, just add one line here.
 * To grant an action to a role, use the shorthand or write it out.
 *
 * Shorthand: R (read) · RU (read+update) · RCU (read+create+update) · FULL (all four)
 */
const resourcePermissions: Record<
  string,
  Partial<Record<StaffRole, readonly string[]>>
> = {
  dashboard:        { superadmin: R,    admin: R,    cashier: R },
  orders:           { superadmin: RCU,  admin: RU,   cashier: RU },
  products:         { superadmin: FULL, admin: R },
  categories:       { superadmin: FULL, admin: R },
  subcategories:    { superadmin: FULL, admin: R },
  customers:        { superadmin: R,    admin: R,    cashier: R },
  promotions:       { superadmin: FULL, admin: R },
  inventories:      { superadmin: RCU,  admin: RCU,  cashier: RCU },
  stores:           { superadmin: FULL },
  staff:            { superadmin: FULL },
  reports:          { superadmin: R,    admin: R,    cashier: R },
  settings:         { superadmin: RU,   admin: R },
  legal:            { superadmin: RU,   admin: R },
  reviews:          { superadmin: RU,   admin: RU,   cashier: RU },
  "activity-logs":  { superadmin: R },
  "modifier-groups":{ superadmin: FULL, admin: R },
  profile:          { superadmin: R,    admin: R,    cashier: R },
  changelog:        { superadmin: R,    admin: R,    cashier: R },
  reservations:     { superadmin: R,    admin: R,    cashier: R },
};

/** Build the "resource.action" string sets from the resource-centric definition above */
function buildPermissionSets(): Record<StaffRole, Set<string>> {
  const result: Record<StaffRole, Set<string>> = {
    [STAFF_ROLES.SUPERADMIN]: new Set(),
    [STAFF_ROLES.ADMIN]: new Set(),
    [STAFF_ROLES.CASHIER]: new Set(),
  };

  for (const [resource, roles] of Object.entries(resourcePermissions)) {
    for (const [role, actions] of Object.entries(roles)) {
      for (const action of actions as string[]) {
        result[role as StaffRole].add(`${resource}.${action}`);
      }
    }
  }

  return result;
}

const permissionSets: Record<StaffRole, Set<string>> = buildPermissionSets();

/** Check whether a role has a given permission (e.g. canAccess("admin", "products.read")) */
export function canAccess(role: StaffRole, permission: string): boolean {
  return permissionSets[role]?.has(permission) ?? false;
}
