export const TypeOfPartner = ["Customer", "Supplier"] as const;
export const UserStatus = [
  "Active",
  "Inactive",
  "Pending",
  "Unverified",
] as const;
export const UserRole = ["Admin", "Employee", "Manager"] as const;
export const ModuleType = ["Single", "Combo", "Both"] as const;
export const CommonStatus = ["Active", "Inactive", "Deleted"] as const;
export const ConsignmentType = ["In", "Out"] as const;
export const DiscountType = ["Fixed", "Percentage"] as const;
export const ItemSourceType = ["Order", "Purchase", "Consignment"] as const;
export const ItemableType = ["Service", "Product"] as const;
export const ItemStatus = [
  "None",
  "Imported",
  "Exported",
  "Transfered",
] as const;
export const TypeOfTransaction = ["Income", "Expense"] as const;
export const TransactionStatus = ["Unpaid", "Paid", "Partial"] as const;

export enum UserRoleEnum {
  ADMIN = "Admin",
  MANAGER = "Manager",
  EMPLOYEE = "Employee",
}
