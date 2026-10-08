'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import type { RouteAccessResult } from '@/shared/auth/access';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/access-denied'];

function isPublicAdminRoute(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(path));
}

interface AdminSessionGuardProps {
  accessResult: RouteAccessResult;
  children: React.ReactNode;
}

function AdminSessionGuardInner({ accessResult, children }: AdminSessionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const shouldBlock = !accessResult.isAllowed && !isPublicAdminRoute(pathname);

  useEffect(() => {
    if (accessResult.isAllowed) return;
    if (isPublicAdminRoute(pathname)) return;

    router.replace(accessResult.redirectTo ?? '/admin/login');
  }, [accessResult, pathname, router]);

  if (shouldBlock) {
    return null;
  }

  return <>{children}</>;
}

export function AdminSessionGuard({ accessResult, children }: AdminSessionGuardProps) {
  return (
    <Suspense fallback={null}>
      <AdminSessionGuardInner accessResult={accessResult}>{children}</AdminSessionGuardInner>
    </Suspense>
  );
}
