import { useStaffContext } from "@/contexts/StaffContext";
import { STAFF_ROLES } from "@/types/staff";

export const useStaffData = () => {
  const staff = useStaffContext();

  const isSuperAdmin = staff?.role === STAFF_ROLES.SUPERADMIN;
  const staffRole = staff?.role;
  
  return {
    staff,
    isSuperAdmin,
    staffRole,
  };
};
