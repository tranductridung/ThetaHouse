export const PartnerTypeConst = ["Customer", "Supplier"] as const;
export const SexType = ["Undefined", "Male", "Female"] as const;
export const UserStatus = [
  "Active",
  "Inactive",
  "Pending",
  "Unverified",
] as const;
export const AppointmentStatus = [
  "Pending",
  "Confirmed",
  "Cancelled",
  "Completed",
] as const;
export const InventoryAction = [
  "Import",
  "Export",
  "Adjust-Minus",
  "Adjust-Plus",
] as const;
export const PaymentMethod = ["Momo", "Bank Transfer", "Visa", "Cash"] as const;
export const UserRole = ["Admin", "Employee", "Manager"] as const;
export const ModuleType = ["Single", "Combo", "Both"] as const;
export const CommonStatus = ["Active", "Inactive", "Deleted"] as const;
export const ConsignmentType = ["In", "Out"] as const;
export const DiscountType = ["Fixed", "Percentage"] as const;
export const TypeOfSource = ["Order", "Purchase", "Consignment"] as const;
export const ItemableType = ["Service", "Product", "Course"] as const;
export const ItemStatus = [
  "None",
  "Imported",
  "Exported",
  "Transfered",
  "Partial",
] as const;
export const TransactionTypeConst = ["Income", "Expense"] as const;
export const TransactionStatus = [
  "Unpaid",
  "Paid",
  "Partial",
  "Overpaid",
] as const;
export const SourceStatus = [
  "Confirmed",
  "Processing",
  "Completed",
  "Cancelled",
] as const;
export const TypeOfAppointment = ["Main", "Free", "Bonus"] as const;
export const CourseMode = ["Online", "Offline", "Combine"] as const;
export const CourseRole = ["Trainer", "Coach"] as const;
export const EnrollmentStatus = ["Pending", "Enrolled", "Withdrawn"] as const;
export const AppointmentCategoryConst = ["Consultation", "Therapy"] as const;

// Type
export type SourceType = (typeof TypeOfSource)[number];
export type SourceStatusType = (typeof SourceStatus)[number];
export type AppointmentStatusType = (typeof AppointmentStatus)[number];
export type ItemStatusType = (typeof ItemStatus)[number];
export type TransactionStatusType = (typeof TransactionStatus)[number];
export type TypeOfConsignment = (typeof ConsignmentType)[number];
export type TypeOfPartner = (typeof PartnerTypeConst)[number];
export type TypeOfTransaction = (typeof TransactionTypeConst)[number];
export type AppointmentCategory = (typeof AppointmentCategoryConst)[number];

// Enum
export enum UserRoleEnum {
  ADMIN = "Admin",
  MANAGER = "Manager",
  EMPLOYEE = "Employee",
}
