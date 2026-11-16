import type { Role } from './roles';

/**
 * Permission keys are the contract for server-side authorization.
 * The client may use them for UI hints only — the server is the only authority.
 */
export const PERMISSIONS = [
  'students:read',
  'students:write',
  'teachers:read',
  'teachers:write',
  'academics:read',
  'academics:write',
  'attendance:read',
  'attendance:mark',
  'attendance:override',
  'fees:read',
  'fees:write',
  'exams:read',
  'exams:write',
  'exams:publish',
  'results:read',
  'reports:read',
  'reports:finance',
  'users:manage',
  'settings:manage',
  'announcements:manage',
  'promotions:manage',
  'audit:read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL_PERMISSIONS: readonly Permission[] = PERMISSIONS;

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ALL_PERMISSIONS,
  teacher: [
    'students:read',
    'teachers:read',
    'academics:read',
    'attendance:read',
    'attendance:mark',
    'exams:read',
    'exams:write',
    'results:read',
    'reports:read',
    'announcements:manage',
  ],
  accountant: ['students:read', 'fees:read', 'fees:write', 'reports:read', 'reports:finance'],
  student: ['attendance:read', 'results:read', 'fees:read'],
  parent: ['students:read', 'attendance:read', 'results:read', 'fees:read'],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
