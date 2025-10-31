import React from "react";
import { usePermission } from "@/hooks/usePermission.hook";

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: "hide" | "disable";
  classNameWhenDisabled?: string;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = "You don’t have permission to access this page.",
  mode = "hide",
  classNameWhenDisabled = "opacity-50 pointer-events-none cursor-not-allowed",
}) => {
  const hasPermission = usePermission(permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (mode === "disable") {
    return <div className={classNameWhenDisabled}>{children}</div>;
  }

  return <>{fallback}</>;
};
