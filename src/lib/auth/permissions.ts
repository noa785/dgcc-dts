// src/lib/auth/permissions.ts
// Client-safe permission check — no server imports
import { type AuthUser, type Permission, hasPermission } from '@/types';

export function can(user: AuthUser, permission: Permission): boolean {
  return hasPermission(user.role, permission);
}
