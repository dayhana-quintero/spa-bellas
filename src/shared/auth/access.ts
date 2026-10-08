import type { AdminSessionInput } from './index';
import { ADMIN_ACCESS_ROLES, getAdminSessionState } from './index';
import { parseAdminSession } from './server';

export type RouteAccessReason = 'missing-session' | 'expired-session' | 'denied-role' | 'invalid-user';

export type RouteAccessResult = {
  isAllowed: boolean;
  reason?: RouteAccessReason;
  redirectTo?: string;
};

const LOGIN_REDIRECT = '/admin/login';
const EXPIRED_REDIRECT = '/admin/login?reason=expired';
const DENIED_REDIRECT = '/admin/access-denied';

function deniedRedirect(reason: RouteAccessReason): string {
  return reason === 'denied-role' || reason === 'invalid-user'
    ? `${DENIED_REDIRECT}?reason=${reason}`
    : DENIED_REDIRECT;
}

function hasAdminAccess(payload: Partial<AdminSessionInput> & { role?: string }): boolean {
  const role = payload.role as string | undefined;
  const isActive = payload.accessStatus === 'activo';
  return Boolean(role && ADMIN_ACCESS_ROLES.has(role as 'admin' | 'manager' | 'owner') && isActive);
}

function classifyDeniedReason(cookieValue: string): RouteAccessReason {
  try {
    const parts = cookieValue.split('.');
    if (parts.length === 2) {
      const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as Partial<AdminSessionInput> & { role?: string };
      if (payload && typeof payload === 'object' && payload.role) {
        return hasAdminAccess(payload) ? 'invalid-user' : 'denied-role';
      }
    }
  } catch {
    // Fall through to JSON attempt
  }

  try {
    const decoded = JSON.parse(cookieValue) as Partial<AdminSessionInput> & { role?: string };
    if (decoded && typeof decoded === 'object' && typeof decoded.role === 'string') {
      return hasAdminAccess(decoded) ? 'invalid-user' : 'denied-role';
    }
  } catch {
    // Not parseable JSON
  }

  return 'invalid-user';
}

export function evaluateRouteAccess(cookieValue?: string | null): RouteAccessResult {
  const state = getAdminSessionState(cookieValue);

  switch (state) {
    case 'missing':
      return {
        isAllowed: false,
        reason: 'missing-session',
        redirectTo: LOGIN_REDIRECT,
      };
    case 'authenticated': {
      const session = parseAdminSession(cookieValue ?? '');
      if (session) {
        return { isAllowed: true };
      }
      return {
        isAllowed: false,
        reason: 'invalid-user',
        redirectTo: deniedRedirect('invalid-user'),
      };
    }
    case 'expired':
      return {
        isAllowed: false,
        reason: 'expired-session',
        redirectTo: EXPIRED_REDIRECT,
      };
    case 'denied': {
      const reason = classifyDeniedReason(cookieValue ?? '');
      return {
        isAllowed: false,
        reason,
        redirectTo: deniedRedirect(reason),
      };
    }
    default:
      return {
        isAllowed: false,
        reason: 'invalid-user',
        redirectTo: deniedRedirect('invalid-user'),
      };
  }
}
