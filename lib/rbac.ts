import { StaffRole } from "@/types/staff";
import { adminPermission } from "./adminPermission";

export function canAccess(role: StaffRole, permission: string){
    return adminPermission[role]?.has(permission) ?? false;
}