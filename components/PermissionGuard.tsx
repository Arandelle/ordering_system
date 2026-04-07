import { useAdminMe } from "@/hooks/api/useAuthMe";
import { canAccess } from "@/lib/roleBasedAccessCtrl";
import React from "react";

const PermissionGuard = ({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission: string;
}) => {
  const { data: admin } = useAdminMe();
  if (!admin || !canAccess(admin.role, permission)) return null;
  return <>{children}</>;
};

export default PermissionGuard;
