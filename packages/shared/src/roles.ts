export const ROLES = ['admin', 'teacher', 'accountant', 'student', 'parent'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  teacher: 'Teacher',
  accountant: 'Accountant',
  student: 'Student',
  parent: 'Parent',
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
