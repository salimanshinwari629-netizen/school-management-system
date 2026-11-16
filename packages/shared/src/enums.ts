export const STUDENT_STATUSES = ['active', 'left', 'graduated'] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_SESSION_STATUSES = ['draft', 'submitted'] as const;
export type AttendanceSessionStatus = (typeof ATTENDANCE_SESSION_STATUSES)[number];

export const INVOICE_STATUSES = ['unpaid', 'partial', 'paid', 'waived'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'cheque', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ENROLLMENT_STATUSES = ['active', 'completed', 'withdrawn'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const PROMOTION_OUTCOMES = ['promote', 'retain', 'graduate'] as const;
export type PromotionOutcome = (typeof PROMOTION_OUTCOMES)[number];
