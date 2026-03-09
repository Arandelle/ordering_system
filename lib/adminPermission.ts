import { StaffRole } from "@/hooks/api/useStaff";

export const adminPermission: Record<StaffRole, string[]> = {
  superadmin: [
    "dashboard.read",
    "order.read",
    "product.read",
    "product.create",
    "product.update",
    "product.delete",
  ],

  admin: [
    "dashboard.read",
    "order.read",
    "product.read",
    "product.create",
    "product.update",
  ],

  cashier: ["dashboard.read", "order.read"],
};
