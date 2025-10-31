import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RequirePermission } from "@/components/commons/require-permission";

interface ActionItemProps {
  permission: string;
  onClick?: () => void;
  children: React.ReactNode;
  mode?: "hide" | "disable";
  className?: string;
}

export const ActionItem: React.FC<ActionItemProps> = ({
  permission,
  onClick,
  children,
  mode = "disable",
  className,
}) => {
  return (
    <RequirePermission permission={permission} mode={mode}>
      <DropdownMenuItem onClick={onClick} className={className}>
        {children}
      </DropdownMenuItem>
    </RequirePermission>
  );
};
