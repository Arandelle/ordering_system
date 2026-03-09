import { StaffRole } from "@/types/staff";

// role: [resource.action] -> admin: [products.create]
export const adminPermission: Record<StaffRole, Set<string>> = {
  superadmin: new Set([
    "dashboard.read",

    "orders.read",
    "orders.update",

    "products.read",
    "products.create",
    "products.update",
    "products.delete",

    "categories.read",
    "categories.create",
    "categories.update",
    "categories.delete",

    "customers.read",

    "stores.read",
    "stores.create",
    "stores.update",
    "stores.delete",

    "staff.read",
    "staff.create",
    "staff.update",
    "staff.delete",

    "reports.read",

    "settings.read",
    "settings.update",
  ]),

  admin: new Set([
    "dashboard.read",

    "orders.read",
    "orders.update",

    "products.read",
    "products.create",
    "products.update",

    "categories.read",
    "categories.create",
    "categories.update",

    "customers.read",

    "reports.read",

    "settings.read",
  ]),

  cashier: new Set([
    "dashboard.read",

    "orders.read",
    "orders.update",

    "customers.read",
  ]),
};