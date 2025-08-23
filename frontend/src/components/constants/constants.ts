// Partner constants
export const PARTNER_TYPE = ["Customer", "Supplier"] as const;

// User constants
export const USER_SEX = ["Undefined", "Male", "Female"] as const;
export const USER_ROLE = ["Admin", "Employee", "Manager"] as const;
export const USER_STATUS = [
  "Active",
  "Inactive",
  "Pending",
  "Unverified",
] as const;

// Appointment constants
export const APPOINTMENT_STATUS = [
  "Pending",
  "Confirmed",
  "Cancelled",
  "Completed",
] as const;
export const APPOINTMENT_CATEGORY = ["Consultation", "Therapy"] as const;
export const APPOINTMENT_TYPE = ["Main", "Free", "Bonus"] as const;

// Inventory constants
export const INVENTORY_ACTION = [
  "Import",
  "Export",
  "Adjust-Minus",
  "Adjust-Plus",
] as const;
export const ITEM_STATUS = [
  "None",
  "Imported",
  "Exported",
  "Transfered",
  "Partial",
] as const;

// Payment constants
export const PAYMENT_METHOD = [
  "Momo",
  "Bank Transfer",
  "Visa",
  "Cash",
] as const;

// Transaction constants
export const TRANSACTION_TYPE = ["Income", "Expense"] as const;
export const TRANSACTION_STATUS = [
  "Unpaid",
  "Paid",
  "Partial",
  "Overpaid",
] as const;

// Course constants
export const COURSE_MODE = ["Online", "Offline", "Combine"] as const;
export const COURSE_ROLE = ["Trainer", "Coach"] as const;
export const ENROLLMENT_STATUS = ["Pending", "Enrolled", "Withdrawn"] as const;

// Module constants
export const MODULE_TYPE = ["Single", "Combo", "Both"] as const;

// Common constants
export const COMMON_STATUS = ["Active", "Inactive", "Deleted"] as const;

// Consignment constants
export const CONSIGNMENT_TYPE = ["In", "Out"] as const;

// Discount constants
export const DISCOUNT_TYPE = ["Fixed", "Percentage"] as const;

// Source constants
export const SOURCE_TYPE = ["Order", "Purchase", "Consignment"] as const;
export const SOURCE_STATUS = [
  "Confirmed",
  "Processing",
  "Completed",
  "Cancelled",
] as const;

// Item constants
export const ITEMABLE_TYPE = ["Service", "Product", "Course"] as const;

// Product constants
export const PRODUCT_UNIT = ["Piece", "Kg", "Box", "Liter", "Package"] as const;

// Only export types that are NOT generated from schemas
// These are enum-like constants that don't have corresponding schema types
export type PartnerTypeConst = (typeof PARTNER_TYPE)[number];
export type UserSexConst = (typeof USER_SEX)[number];
export type UserRoleConst = (typeof USER_ROLE)[number];
export type UserStatusConst = (typeof USER_STATUS)[number];
export type AppointmentTypeConst = (typeof APPOINTMENT_TYPE)[number];
export type AppointmentStatusConst = (typeof APPOINTMENT_STATUS)[number];
export type AppointmentCategoryConst = (typeof APPOINTMENT_CATEGORY)[number];
export type InventoryActionConst = (typeof INVENTORY_ACTION)[number];
export type ItemStatusConst = (typeof ITEM_STATUS)[number];
export type PaymentMethodConst = (typeof PAYMENT_METHOD)[number];
export type TransactionTypeConst = (typeof TRANSACTION_TYPE)[number];
export type TransactionStatusConst = (typeof TRANSACTION_STATUS)[number];
export type CourseModeConst = (typeof COURSE_MODE)[number];
export type CourseRoleConst = (typeof COURSE_ROLE)[number];
export type EnrollmentStatusConst = (typeof ENROLLMENT_STATUS)[number];
export type ModuleTypeConst = (typeof MODULE_TYPE)[number];
export type CommonStatusConst = (typeof COMMON_STATUS)[number];
export type ConsignmentTypeConst = (typeof CONSIGNMENT_TYPE)[number];
export type DiscountTypeConst = (typeof DISCOUNT_TYPE)[number];
export type SourceTypeConst = (typeof SOURCE_TYPE)[number];
export type SourceStatusConst = (typeof SOURCE_STATUS)[number];
export type ItemableTypeConst = (typeof ITEMABLE_TYPE)[number];
export type ProductUnitConst = (typeof PRODUCT_UNIT)[number];
