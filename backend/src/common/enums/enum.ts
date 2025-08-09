export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  UNVERIFIED = 'Unverified',
}

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
}

export enum ProductUnit {
  PIECE = 'Piece',
  KG = 'Kg',
  BOX = 'Box',
  LITER = 'Liter',
  PACKAGE = 'Package',
}

export enum InventoryAction {
  EXPORT = 'Export',
  IMPORT = 'Import',
  ADJUST_MINUS = 'Adjust-Minus',
  ADJUST_PLUS = 'Adjust-Plus',
}
export enum ServiceType {
  SINGLE = 'Single',
  COMBO = 'Combo',
}

export enum ConsignmentType {
  IN = 'In',
  OUT = 'Out',
}

export enum DiscountType {
  PERCENTAGE = 'Percentage',
  FIXED = 'Fixed',
}

export enum SourceType {
  ORDER = 'Order',
  PURCHASE = 'Purchase',
  CONSIGNMENT = 'Consignment',
}

export enum ItemableType {
  COURSE = 'Course',
  SERVICE = 'Service',
  PRODUCT = 'Product',
}

export enum AppointmentStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum AppointmentType {
  BONUS = 'Bonus',
  FREE = 'Free',
  MAIN = 'Main',
}
export enum ModuleType {
  SINGLE = 'Single',
  COMBO = 'Combo',
  BOTH = 'Both',
}

export enum CommonStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DELETED = 'Deleted',
}

export enum PartnerType {
  CUSTOMER = 'Customer',
  SUPPLIER = 'Supplier',
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum TransactionStatus {
  UNPAID = 'Unpaid',
  PAID = 'Paid',
  PARTIAL = 'Partial',
  OVERPAID = 'Overpaid',
}

export enum PaymentMethod {
  MOMO = 'Momo',
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  VISA = 'Visa',
}

export enum ItemStatus {
  NONE = 'None',
  PARTIAL = 'Partial',
  IMPORTED = 'Imported',
  EXPORTED = 'Exported',
  TRANSFERED = 'Transfered',
  CHANGED = 'Changed',
}

export enum AdjustmentType {
  INIT = 'Init', // Init when create source
  ADD = 'Add', // Add new item to source after source created
  REMOVE = 'Remove', // Remove item of source
  CANCELLED = 'Cancelled', // Cancelled source
}

export enum SourceStatus {
  CONFIRMED = 'Confirmed',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum SexType {
  UNDEFINED = 'Undefined',
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum CourseMode {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  COMBINE = 'Combine',
}

export enum EnrollmentStatus {
  PENDING = 'Pending',
  ENROLLED = 'Enrolled',
  WITHDRAWN = 'Withdrawn',
}

export enum CourseRole {
  COACH = 'Coach',
  TRAINER = 'Trainer',
}

export enum PayerType {
  USER = 'User',
  PARTNER = 'Partner',
}

export enum AppointmentCategory {
  THERAPY = 'Therapy',
  CONSULTATION = 'Consultation',
}

export enum ResponseCalendarStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  NOT_CONNECTED = 'not_connected',
}
