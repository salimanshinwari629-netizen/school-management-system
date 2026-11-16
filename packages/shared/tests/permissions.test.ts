import { describe, expect, it } from 'vitest';
import { roleHasPermission, ROLE_PERMISSIONS } from '../src/permissions';
import { isRole, ROLES } from '../src/roles';

describe('roles and permissions', () => {
  it('recognises only the five approved roles', () => {
    expect(ROLES).toHaveLength(5);
    expect(isRole('accountant')).toBe(true);
    expect(isRole('librarian')).toBe(false);
  });

  it('scopes permissions by role', () => {
    expect(roleHasPermission('accountant', 'fees:write')).toBe(true);
    expect(roleHasPermission('teacher', 'fees:write')).toBe(false);
    expect(roleHasPermission('admin', 'settings:manage')).toBe(true);
    expect(ROLE_PERMISSIONS.student).not.toContain('students:write');
  });
});
