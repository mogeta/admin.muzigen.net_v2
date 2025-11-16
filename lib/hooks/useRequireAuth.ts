'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

/**
 * Custom hook that requires authentication.
 * Redirects to signin page if user is not authenticated.
 *
 * @param redirectTo - Optional redirect path (defaults to '/signin')
 * @returns Auth context values (user, loading, signOut)
 *
 * @example
 * function ProtectedPage() {
 *   const { user, loading } = useRequireAuth();
 *
 *   if (loading) return <Loading />;
 *
 *   return <div>Hello {user.email}</div>;
 * }
 */
export function useRequireAuth(redirectTo: string = '/signin') {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push(redirectTo);
    }
  }, [auth.user, auth.loading, router, redirectTo]);

  return auth;
}
