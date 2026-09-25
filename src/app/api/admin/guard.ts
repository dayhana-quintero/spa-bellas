import { cookies } from 'next/headers';
import { cookieName, parseAdminSession } from '@/shared/auth/server';

export async function requireAdmin() { const session = parseAdminSession((await cookies()).get(cookieName)?.value); if (!session) throw new Error('No autorizado'); return session; }
